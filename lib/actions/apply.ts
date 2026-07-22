"use server";

// This action is intentionally public - no session/auth check - since an
// admission application is submitted by someone who does not have an
// account yet. It only ever creates an AdmissionApplication row; it never
// creates a User/login account. Turning an application into an actual
// student login is a separate, deliberate step an admin takes from
// /admin/admissions once the application is reviewed and approved.

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export type ApplyState = {
  error?: string;
  success?: boolean;
  applicationNumber?: string;
};

const REQUIRED_FIELDS = [
  "firstName",
  "lastName",
  "dateOfBirth",
  "gender",
  "email",
  "phone",
  "address",
  "city",
  "province",
  "guardianName",
  "guardianRelation",
  "guardianPhone",
  "guardianCnic",
  "desiredProgram",
  "previousSchool",
  "previousGrade",
] as const;

// Each of these must be an uploaded file (scan or clear photo), matching
// the physical documents the admissions office asks for. The bytes are
// stored directly in Neon (Postgres) - no external file-storage service.
const REQUIRED_DOCUMENT_FIELDS = [
  { field: "dmcFile", label: "SSC (Matric) DMC" },
  { field: "bformFile", label: "Student's B-Form" },
  { field: "cnicFile", label: "Father's CNIC" },
  { field: "photoFile", label: "Passport-size photograph" },
] as const;

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB per document (keeps each
// request comfortably under typical serverless request-body limits)
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

type PendingDocument = {
  label: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  data: Buffer;
};

async function readDocument(
  formData: FormData,
  field: string,
  label: string
): Promise<{ doc?: PendingDocument; error?: string }> {
  const file = formData.get(field);

  if (!(file instanceof File) || file.size === 0) {
    return { error: `Please upload your ${label}.` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { error: `${label}: file is too large. Maximum size is 4MB.` };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: `${label}: upload a JPG, PNG, or PDF file.` };
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  return {
    doc: {
      label,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      data: bytes,
    },
  };
}

export async function submitApplicationAction(
  _prevState: ApplyState,
  formData: FormData
): Promise<ApplyState> {
  const values: Record<string, string> = {};
  for (const field of REQUIRED_FIELDS) {
    values[field] = String(formData.get(field) ?? "").trim();
  }

  const missing = REQUIRED_FIELDS.filter((f) => !values[f]);
  if (missing.length > 0) {
    return { error: "Please fill in all required fields." };
  }

  const previousMarks = Number(values.previousGrade);
  if (Number.isNaN(previousMarks) || previousMarks < 0 || previousMarks > 100) {
    return { error: "Enter your SSC marks as a percentage between 0 and 100." };
  }
  if (previousMarks < 40) {
    return {
      error:
        "A minimum of 40% marks in the SSC (Matric) examination is required to apply.",
    };
  }

  const email = values.email.toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const cnic = String(formData.get("cnic") ?? "").trim() || null;
  if (cnic) {
    const existingCnic = await prisma.admissionApplication.findUnique({
      where: { cnic },
    });
    if (existingCnic) {
      return { error: "An application with this CNIC already exists." };
    }
  }

  // Read and validate each required document. Stop at the first failure
  // rather than partially processing - the applicant fixes one file and
  // resubmits.
  const documents: PendingDocument[] = [];
  for (const { field, label } of REQUIRED_DOCUMENT_FIELDS) {
    const result = await readDocument(formData, field, label);
    if (result.error) {
      return { error: result.error };
    }
    if (result.doc) {
      documents.push(result.doc);
    }
  }

  const application = await prisma.admissionApplication.create({
    data: {
      firstName: values.firstName,
      lastName: values.lastName,
      dateOfBirth: new Date(values.dateOfBirth),
      gender: values.gender as "MALE" | "FEMALE" | "OTHER",
      nationality: String(formData.get("nationality") ?? "").trim() || null,
      cnic,
      religion: String(formData.get("religion") ?? "").trim() || null,
      email,
      phone: values.phone,
      address: values.address,
      city: values.city,
      province: values.province,
      guardianName: values.guardianName,
      guardianRelation: values.guardianRelation,
      guardianPhone: values.guardianPhone,
      guardianCnic: values.guardianCnic,
      guardianOccupation:
        String(formData.get("guardianOccupation") ?? "").trim() || null,
      desiredProgram: values.desiredProgram,
      previousSchool: values.previousSchool,
      previousMarks: previousMarks,
      status: "SUBMITTED",
      submittedAt: new Date(),
      uploadedDocuments: {
        create: documents.map((doc) => ({
          label: doc.label,
          fileName: doc.fileName,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
          data: doc.data,
        })),
      },
    },
  });

  // Best-effort: the application is already saved at this point, so an
  // email hiccup should never make the applicant think their submission
  // failed. Failures are logged server-side but not surfaced to them.
  await sendEmail({
    to: email,
    subject: `Application received - ${application.applicationNumber}`,
    html: `
      <p>Dear ${values.firstName},</p>
      <p>Your admission application to EEF Polytechnic Institute of Haripur has been received.</p>
      <p><strong>Application number:</strong> ${application.applicationNumber}</p>
      <p><strong>Program applied for:</strong> ${values.desiredProgram}</p>
      <p>Save your application number - the registrar's office will contact
      you by email or phone about the next steps.</p>
      <p>EEF Polytechnic Institute Admissions Office</p>
    `,
  });

  return { success: true, applicationNumber: application.applicationNumber };
}
