"use server";

// This action is intentionally public - no session/auth check - since an
// admission application is submitted by someone who does not have an
// account yet. It only ever creates an AdmissionApplication row; it never
// creates a User/login account. Turning an application into an actual
// student login is a separate, deliberate step an admin takes from
// /admin/admissions once the application is reviewed and approved.

import { prisma } from "@/lib/prisma";

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
  "desiredProgram",
  "previousSchool",
] as const;

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
      guardianCnic: String(formData.get("guardianCnic") ?? "").trim() || null,
      guardianOccupation:
        String(formData.get("guardianOccupation") ?? "").trim() || null,
      desiredProgram: values.desiredProgram,
      previousSchool: values.previousSchool,
      previousGrade:
        String(formData.get("previousGrade") ?? "").trim() || null,
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });

  return { success: true, applicationNumber: application.applicationNumber };
}
