"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, isAdminRole, getAdminRoute } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    throw new Error("Not authorized.");
  }
  return session;
}

function adminBase() {
  return `/${getAdminRoute()}`;
}

export type ActionState = {
  error?: string;
  success?: string;
};

// Creates an enrolled student record. This is an internal record only -
// it does not create a login account. There is no student portal, so
// students never sign in anywhere on this site.
export async function createStudentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase() || null;
  const rollNumber = String(formData.get("rollNumber") ?? "").trim();
  const departmentId = String(formData.get("departmentId") ?? "") || null;
  const gender = String(formData.get("gender") ?? "MALE");
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "");

  if (!firstName || !lastName || !rollNumber || !dateOfBirth) {
    return { error: "Fill in all required fields." };
  }

  const existingRoll = await prisma.student.findUnique({ where: { rollNumber } });
  if (existingRoll) {
    return { error: "A student with this roll number already exists." };
  }

  await prisma.student.create({
    data: {
      rollNumber,
      firstName,
      lastName,
      email,
      gender: gender as "MALE" | "FEMALE" | "OTHER",
      dateOfBirth: new Date(dateOfBirth),
      departmentId: departmentId || undefined,
    },
  });

  revalidatePath(`${adminBase()}/students`);
  redirect(`${adminBase()}/students?created=1`);
}

export async function deleteStudentAction(formData: FormData) {
  await requireAdmin();
  const studentId = String(formData.get("studentId") ?? "");
  if (!studentId) return;

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return;

  try {
    await prisma.student.delete({ where: { id: studentId } });
  } catch {
    revalidatePath(`${adminBase()}/students`);
    redirect(
      `${adminBase()}/students?error=${encodeURIComponent(
        "Could not delete: this student still has linked records (fees, attendance, etc.)."
      )}`
    );
  }

  revalidatePath(`${adminBase()}/students`);
  redirect(`${adminBase()}/students?deleted=1`);
}
