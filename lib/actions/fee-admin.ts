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

type FeeFormValues = {
  name: string;
  academicYearId: string;
  departmentId: string | null;
  dueDate: Date;
  isActive: boolean;
  tuitionFee: number;
  admissionFee: number;
  examFee: number;
  libraryFee: number;
  sportsFee: number;
  otherFee: number;
  totalAmount: number;
};

function readFeeForm(formData: FormData): FeeFormValues | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const academicYearId = String(formData.get("academicYearId") ?? "").trim();
  const departmentId = String(formData.get("departmentId") ?? "").trim() || null;
  const dueDateRaw = String(formData.get("dueDate") ?? "");
  const isActive = formData.get("isActive") === "on";

  if (!name || !academicYearId || !dueDateRaw) {
    return { error: "Fill in all required fields." };
  }

  const dueDate = new Date(dueDateRaw);
  if (Number.isNaN(dueDate.getTime())) {
    return { error: "Enter a valid due date." };
  }

  const numberFields = [
    "tuitionFee",
    "admissionFee",
    "examFee",
    "libraryFee",
    "sportsFee",
    "otherFee",
  ] as const;

  const amounts: Record<(typeof numberFields)[number], number> = {
    tuitionFee: 0,
    admissionFee: 0,
    examFee: 0,
    libraryFee: 0,
    sportsFee: 0,
    otherFee: 0,
  };

  for (const field of numberFields) {
    const raw = String(formData.get(field) ?? "0").trim();
    const value = raw === "" ? 0 : Number(raw);
    if (Number.isNaN(value) || value < 0) {
      return { error: "Fee amounts must be zero or a positive number." };
    }
    amounts[field] = value;
  }

  const totalAmount =
    amounts.tuitionFee +
    amounts.admissionFee +
    amounts.examFee +
    amounts.libraryFee +
    amounts.sportsFee +
    amounts.otherFee;

  if (totalAmount <= 0) {
    return { error: "Total amount must be greater than zero — enter at least one fee component." };
  }

  return {
    name,
    academicYearId,
    departmentId,
    dueDate,
    isActive,
    ...amounts,
    totalAmount,
  };
}

export async function createFeeStructureAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = readFeeForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  await prisma.feeStructure.create({
    data: {
      name: parsed.name,
      academicYearId: parsed.academicYearId,
      departmentId: parsed.departmentId ?? undefined,
      dueDate: parsed.dueDate,
      isActive: parsed.isActive,
      tuitionFee: parsed.tuitionFee,
      admissionFee: parsed.admissionFee,
      examFee: parsed.examFee,
      libraryFee: parsed.libraryFee,
      sportsFee: parsed.sportsFee,
      otherFee: parsed.otherFee,
      totalAmount: parsed.totalAmount,
    },
  });

  revalidatePath(`${adminBase()}/fees`);
  redirect(`${adminBase()}/fees?created=1`);
}

export async function updateFeeStructureAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const feeStructureId = String(formData.get("feeStructureId") ?? "");
  if (!feeStructureId) {
    return { error: "Missing fee structure reference." };
  }

  const parsed = readFeeForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  await prisma.feeStructure.update({
    where: { id: feeStructureId },
    data: {
      name: parsed.name,
      academicYearId: parsed.academicYearId,
      departmentId: parsed.departmentId ?? null,
      dueDate: parsed.dueDate,
      isActive: parsed.isActive,
      tuitionFee: parsed.tuitionFee,
      admissionFee: parsed.admissionFee,
      examFee: parsed.examFee,
      libraryFee: parsed.libraryFee,
      sportsFee: parsed.sportsFee,
      otherFee: parsed.otherFee,
      totalAmount: parsed.totalAmount,
    },
  });

  revalidatePath(`${adminBase()}/fees`);
  redirect(`${adminBase()}/fees?updated=1`);
}

export async function deleteFeeStructureAction(formData: FormData) {
  await requireAdmin();
  const feeStructureId = String(formData.get("feeStructureId") ?? "");
  if (!feeStructureId) return;

  const structure = await prisma.feeStructure.findUnique({
    where: { id: feeStructureId },
  });
  if (!structure) return;

  try {
    await prisma.feeStructure.delete({ where: { id: feeStructureId } });
  } catch {
    revalidatePath(`${adminBase()}/fees`);
    redirect(
      `${adminBase()}/fees?error=${encodeURIComponent(
        "Could not delete: students are already assigned to this fee structure."
      )}`
    );
  }

  revalidatePath(`${adminBase()}/fees`);
  redirect(`${adminBase()}/fees?deleted=1`);
}
