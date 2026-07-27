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

// The current academic year is resolved automatically rather than asked
// for in the form - fee structures are organized by program year (1st/
// 2nd/3rd), not by calendar year.
async function resolveAcademicYearId(): Promise<string> {
  const current = await prisma.academicYear.findFirst({
    where: { isCurrent: true },
    orderBy: { startDate: "desc" },
  });
  if (current) return current.id;

  const latest = await prisma.academicYear.findFirst({
    orderBy: { startDate: "desc" },
  });
  if (latest) return latest.id;

  throw new Error(
    "No academic year exists yet - seed one before adding a fee structure."
  );
}

const FEE_FIELDS = [
  "admissionFee",
  "tuitionFee",
  "boardRegistrationFee",
  "collegeCardFee",
  "migrationFee",
  "sportsFee",
  "studyTourFee",
  "miscellaneousFee",
] as const;

type FeeFormValues = {
  name: string;
  departmentId: string | null;
  programYear: number | null;
  dueDate: Date;
  isActive: boolean;
  totalAmount: number;
} & Record<(typeof FEE_FIELDS)[number], number>;

function readFeeForm(formData: FormData): FeeFormValues | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const departmentId = String(formData.get("departmentId") ?? "").trim() || null;
  const programYearRaw = String(formData.get("programYear") ?? "").trim();
  const dueDateRaw = String(formData.get("dueDate") ?? "");
  const isActive = formData.get("isActive") === "on";

  if (!name || !dueDateRaw) {
    return { error: "Fill in all required fields." };
  }

  const dueDate = new Date(dueDateRaw);
  if (Number.isNaN(dueDate.getTime())) {
    return { error: "Enter a valid due date." };
  }

  const programYear = programYearRaw ? Number(programYearRaw) : null;
  if (programYear !== null && ![1, 2, 3].includes(programYear)) {
    return { error: "Select a valid year." };
  }

  const amounts = {} as Record<(typeof FEE_FIELDS)[number], number>;
  for (const field of FEE_FIELDS) {
    const raw = String(formData.get(field) ?? "0").trim();
    const value = raw === "" ? 0 : Number(raw);
    if (Number.isNaN(value) || value < 0) {
      return { error: "Fee amounts must be zero or a positive number." };
    }
    amounts[field] = value;
  }

  const totalAmount = FEE_FIELDS.reduce((sum, field) => sum + amounts[field], 0);

  if (totalAmount <= 0) {
    return {
      error:
        "Total amount must be greater than zero — enter at least one fee component.",
    };
  }

  return {
    name,
    departmentId,
    programYear,
    dueDate,
    isActive,
    totalAmount,
    ...amounts,
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

  const academicYearId = await resolveAcademicYearId();

  await prisma.feeStructure.create({
    data: {
      name: parsed.name,
      academicYearId,
      departmentId: parsed.departmentId ?? undefined,
      programYear: parsed.programYear,
      dueDate: parsed.dueDate,
      isActive: parsed.isActive,
      admissionFee: parsed.admissionFee,
      tuitionFee: parsed.tuitionFee,
      boardRegistrationFee: parsed.boardRegistrationFee,
      collegeCardFee: parsed.collegeCardFee,
      migrationFee: parsed.migrationFee,
      sportsFee: parsed.sportsFee,
      studyTourFee: parsed.studyTourFee,
      miscellaneousFee: parsed.miscellaneousFee,
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
      departmentId: parsed.departmentId ?? null,
      programYear: parsed.programYear,
      dueDate: parsed.dueDate,
      isActive: parsed.isActive,
      admissionFee: parsed.admissionFee,
      tuitionFee: parsed.tuitionFee,
      boardRegistrationFee: parsed.boardRegistrationFee,
      collegeCardFee: parsed.collegeCardFee,
      migrationFee: parsed.migrationFee,
      sportsFee: parsed.sportsFee,
      studyTourFee: parsed.studyTourFee,
      miscellaneousFee: parsed.miscellaneousFee,
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
