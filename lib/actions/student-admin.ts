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

type StudentFormValues = {
  firstName: string;
  lastName: string;
  rollNumber: string;
  dateOfBirth: Date;
  gender: "MALE" | "FEMALE" | "OTHER";
  email: string | null;
  phone: string | null;
  whatsappNumber: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  departmentId: string | null;
  classId: string | null;
};

function readStudentForm(formData: FormData): StudentFormValues | { error: string } {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const rollNumber = String(formData.get("rollNumber") ?? "").trim();
  const dateOfBirthRaw = String(formData.get("dateOfBirth") ?? "");
  const gender = String(formData.get("gender") ?? "MALE") as "MALE" | "FEMALE" | "OTHER";

  if (!firstName || !lastName || !rollNumber || !dateOfBirthRaw) {
    return { error: "Fill in all required fields." };
  }

  const dateOfBirth = new Date(dateOfBirthRaw);
  if (Number.isNaN(dateOfBirth.getTime())) {
    return { error: "Enter a valid date of birth." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const whatsappNumber =
    String(formData.get("whatsappNumber") ?? "").trim() || null;
  const guardianName = String(formData.get("guardianName") ?? "").trim() || null;
  const guardianPhone =
    String(formData.get("guardianPhone") ?? "").trim() || null;
  const departmentId = String(formData.get("departmentId") ?? "").trim() || null;
  const classId = String(formData.get("classId") ?? "").trim() || null;

  return {
    firstName,
    lastName,
    rollNumber,
    dateOfBirth,
    gender,
    email,
    phone,
    whatsappNumber,
    guardianName,
    guardianPhone,
    departmentId,
    classId,
  };
}

// Assigns (or reassigns) a student's single "current" class. A student can
// technically belong to more than one StudentClass row over time, but the
// admin form only manages one active assignment at a time - switching
// classes deactivates the old assignment rather than deleting its history.
async function syncStudentClass(studentId: string, classId: string | null) {
  const currentActive = await prisma.studentClass.findFirst({
    where: { studentId, isActive: true },
  });

  if (currentActive && currentActive.classId === classId) {
    return; // already correctly assigned, nothing to do
  }

  if (currentActive) {
    await prisma.studentClass.update({
      where: { id: currentActive.id },
      data: { isActive: false },
    });
  }

  if (!classId) return;

  const existingForClass = await prisma.studentClass.findUnique({
    where: { studentId_classId: { studentId, classId } },
  });

  if (existingForClass) {
    await prisma.studentClass.update({
      where: { id: existingForClass.id },
      data: { isActive: true },
    });
  } else {
    await prisma.studentClass.create({
      data: { studentId, classId },
    });
  }
}

// Creates an enrolled student record. This is an internal record only -
// it does not create a login account. There is no student portal, so
// students never sign in anywhere on this site.
export async function createStudentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = readStudentForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const existingRoll = await prisma.student.findUnique({
    where: { rollNumber: parsed.rollNumber },
  });
  if (existingRoll) {
    return { error: "A student with this roll number already exists." };
  }

  const student = await prisma.student.create({
    data: {
      rollNumber: parsed.rollNumber,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email,
      phone: parsed.phone,
      whatsappNumber: parsed.whatsappNumber,
      guardianName: parsed.guardianName,
      guardianPhone: parsed.guardianPhone,
      gender: parsed.gender,
      dateOfBirth: parsed.dateOfBirth,
      departmentId: parsed.departmentId ?? undefined,
    },
  });

  if (parsed.classId) {
    await syncStudentClass(student.id, parsed.classId);
  }

  revalidatePath(`${adminBase()}/students`);
  redirect(`${adminBase()}/students?created=1`);
}

export async function updateStudentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const studentId = String(formData.get("studentId") ?? "");
  if (!studentId) {
    return { error: "Missing student reference." };
  }

  const parsed = readStudentForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const existingRoll = await prisma.student.findUnique({
    where: { rollNumber: parsed.rollNumber },
  });
  if (existingRoll && existingRoll.id !== studentId) {
    return { error: "Another student already uses this roll number." };
  }

  await prisma.student.update({
    where: { id: studentId },
    data: {
      rollNumber: parsed.rollNumber,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email,
      phone: parsed.phone,
      whatsappNumber: parsed.whatsappNumber,
      guardianName: parsed.guardianName,
      guardianPhone: parsed.guardianPhone,
      gender: parsed.gender,
      dateOfBirth: parsed.dateOfBirth,
      departmentId: parsed.departmentId,
    },
  });

  await syncStudentClass(studentId, parsed.classId);

  revalidatePath(`${adminBase()}/students`);
  revalidatePath(`${adminBase()}/students/${studentId}`);
  redirect(`${adminBase()}/students/${studentId}?updated=1`);
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
