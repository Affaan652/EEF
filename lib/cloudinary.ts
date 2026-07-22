import { v2 as cloudinary, type UploadApiOptions } from "cloudinary";

let configured = false;

function ensureConfigured(): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return false;
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    configured = true;
  }

  return true;
}

// Every EEF upload (from any feature, not just admissions) lives under
// this one root folder in the Cloudinary account, so the media library
// stays organized as more upload features get added later.
const ROOT_FOLDER = "EEF";

// Compression settings shared by every page/photo we store: cap the
// dimensions of what is genuinely an ID-card / document photo, let
// Cloudinary pick the best modern format, and push quality down
// aggressively. Cloudinary doesn't offer a hard "exact byte target"
// knob, but this combination reliably lands small without visibly
// hurting legibility.
const COMPRESSION = {
  width: 1000,
  height: 1000,
  crop: "limit" as const,
  quality: "auto:low" as const,
  fetch_format: "auto" as const,
};

export type CloudinaryPage = {
  url: string;
  bytes: number;
  pageNumber: number;
  totalPages: number;
};

export type CloudinaryDocumentResult = {
  publicId: string;
  storedMimeType: string;
  pages: CloudinaryPage[];
};

// Uploads one document (photo or PDF) to Cloudinary and returns every
// page as its own compressed JPEG. Returns null (rather than throwing)
// when Cloudinary isn't configured yet, so the caller can still save its
// record without blocking on file storage.
//
// subFolder groups uploads by feature, e.g. "admissions" -> EEF/admissions.
//
// A photo (JPG/PNG/WEBP) always comes back as a single page. A PDF is
// converted page-by-page into compressed JPEGs - a single-page DMC/
// B-Form scan produces one page like a photo would, and a multi-page
// PDF produces one entry per page, so nothing gets silently dropped.
export async function uploadDocumentToCloudinary(
  buffer: Buffer,
  mimeType: string,
  fileNameHint: string,
  subFolder: string
): Promise<CloudinaryDocumentResult | null> {
  if (!ensureConfigured()) {
    console.warn(
      "Cloudinary is not configured (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET) - skipping upload for " +
        fileNameHint
    );
    return null;
  }

  const isPdf = mimeType === "application/pdf";

  const uploadOptions: UploadApiOptions = {
    folder: `${ROOT_FOLDER}/${subFolder}`,
    resource_type: "image",
    transformation: [
      ...(isPdf ? [{ page: 1 }] : []),
      { width: COMPRESSION.width, height: COMPRESSION.height, crop: COMPRESSION.crop },
      { quality: COMPRESSION.quality, fetch_format: COMPRESSION.fetch_format },
    ],
  };
  if (isPdf) {
    uploadOptions.format = "jpg";
  }

  // First upload: this also tells us (via `pages`) how many pages the
  // original PDF actually has, if any.
  const result = await new Promise<{
    secure_url: string;
    public_id: string;
    bytes: number;
    pages?: number;
  }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, res) => {
        if (error || !res) {
          reject(error ?? new Error("Cloudinary upload failed with no result."));
          return;
        }
        resolve(res as unknown as { secure_url: string; public_id: string; bytes: number; pages?: number });
      }
    );
    uploadStream.end(buffer);
  });

  const totalPages = isPdf ? result.pages ?? 1 : 1;

  const pages: CloudinaryPage[] = [
    { url: result.secure_url, bytes: result.bytes, pageNumber: 1, totalPages },
  ];

  // Additional pages (page 2 onward) each get their own compressed
  // derived version, generated immediately (not lazily on first view) so
  // an admin never hits a slow/uncached first request.
  for (let pageNumber = 2; pageNumber <= totalPages; pageNumber++) {
    const explicitResult = await cloudinary.uploader.explicit(result.public_id, {
      type: "upload",
      resource_type: "image",
      eager: [
        {
          page: pageNumber,
          width: COMPRESSION.width,
          height: COMPRESSION.height,
          crop: COMPRESSION.crop,
          quality: COMPRESSION.quality,
          fetch_format: COMPRESSION.fetch_format,
          format: "jpg",
        },
      ],
      eager_async: false,
    });

    const eager = explicitResult?.eager?.[0];
    if (eager) {
      pages.push({
        url: eager.secure_url,
        bytes: eager.bytes,
        pageNumber,
        totalPages,
      });
    }
  }

  return {
    publicId: result.public_id,
    storedMimeType: isPdf ? "image/jpeg" : mimeType,
    pages,
  };
}
