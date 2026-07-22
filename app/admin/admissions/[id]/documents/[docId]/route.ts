import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAdminRole } from "@/lib/auth";

// Streams a single uploaded admission document's bytes back to an
// authenticated admin. This route lives under /admin/... so the same
// middleware that protects the rest of the admin console (secret path +
// session cookie) already guards it - no separate auth code needed here
// beyond a defensive re-check.
export async function GET(
  _request: Request,
  { params }: { params: { id: string; docId: string } }
) {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const doc = await prisma.applicationDocument.findFirst({
    where: { id: params.docId, applicationId: params.id },
  });

  if (!doc) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(doc.data), {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": `inline; filename="${doc.fileName.replace(/"/g, "")}"`,
      "Cache-Control": "private, max-age=0, no-store",
    },
  });
}
