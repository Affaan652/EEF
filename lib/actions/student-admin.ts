"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, isAdminRole, hashPassword, getAdminRoute } from "@/lib/auth";

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

function randomTempPassword(): string {
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 8);
}

export async function createStudentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const rollNumber = String(formData.get("rollNumber") ?? "").trim();
  const departmentId = String(formData.get("departmentId") ?? "") || null;
  const gender = String(formData.get("gender") ?? "MALE");
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "");

  if (!firstName || !lastName || !email || !rollNumber || !dateOfBirth) {
    return { error: "Fill in all required fields." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "An account with this email already exists." };
  }

  const existingRoll = await prisma.student.findUnique({ where: { rollNumber } });
  if (existingRoll) {
    return { error: "A student with this roll number already exists." };
  }

  const tempPassword = randomTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "STUDENT",
      isActive: true,
      student: {
        create: {
          rollNumber,
          firstName,
          lastName,
          gender: gender as "MALE" | "FEMALE" | "OTHER",
          dateOfBirth: new Date(dateOfBirth),
          departmentId: departmentId || undefined,
        },
      },
    },
  });

  revalidatePath(`${adminBase()}/students`);
  redirect(
    `${adminBase()}/students?created=1&email=${encodeURIComponent(
      email
    )}&temp=${encodeURIComponent(tempPassword)}`
  );
}

export async function deleteStudentAction(formData: FormData) {
  await requireAdmin();
  const studentId = String(formData.get("studentId") ?? "");
  if (!studentId) return;

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return;

  try {
    await prisma.$transaction([
      prisma.student.delete({ where: { id: studentId } }),
      prisma.user.delete({ where: { id: student.userId } }),
    ]);
  } catch {
    revalidatePath(`${adminBase()}/students`);
    redirect(
      `${adminBase()}/students?error=${encodeURIComponent(
        "Could not delete: this student still has linked records (classes, marks, etc.)."
      )}`
    );
  }

  revalidatePath(`${adminBase()}/students`);
  redirect(`${adminBase()}/students?deleted=1`);
}
