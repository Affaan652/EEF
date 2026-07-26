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

function computeStatus(paidAmount: number, totalAmount: number) {
  if (paidAmount >= totalAmount) return "PAID";
  if (paidAmount > 0) return "PARTIALLY_PAID";
  return "UNPAID";
}

// Assigns a fee structure to a student, creating the bill they now owe.
export async function assignFeeStructureAction(formData: FormData) {
  await requireAdmin();

  const studentId = String(formData.get("studentId") ?? "");
  const feeStructureId = String(formData.get("feeStructureId") ?? "");
  if (!studentId || !feeStructureId) {
    redirect(
      `${adminBase()}/students/${studentId}?error=${encodeURIComponent(
        "Select a fee structure."
      )}`
    );
  }

  const structure = await prisma.feeStructure.findUnique({
    where: { id: feeStructureId },
  });
  if (!structure) {
    redirect(
      `${adminBase()}/students/${studentId}?error=${encodeURIComponent(
        "That fee structure no longer exists."
      )}`
    );
  }

  const existing = await prisma.studentFee.findUnique({
    where: { studentId_feeStructureId: { studentId, feeStructureId } },
  });
  if (existing) {
    redirect(
      `${adminBase()}/students/${studentId}?error=${encodeURIComponent(
        "This fee structure is already assigned to this student."
      )}`
    );
  }

  await prisma.studentFee.create({
    data: {
      studentId,
      feeStructureId,
      dueDate: structure!.dueDate,
      remainingAmount: structure!.totalAmount,
    },
  });

  revalidatePath(`${adminBase()}/students/${studentId}`);
  redirect(`${adminBase()}/students/${studentId}?feeAssigned=1`);
}

// Records a payment against an assigned fee, updating the running total.
export async function recordPaymentAction(formData: FormData) {
  const session = await requireAdmin();

  const studentId = String(formData.get("studentId") ?? "");
  const studentFeeId = String(formData.get("studentFeeId") ?? "");
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const paymentMethod = String(formData.get("paymentMethod") ?? "CASH");
  const amount = Number(amountRaw);

  if (!studentFeeId || !amountRaw || Number.isNaN(amount) || amount <= 0) {
    redirect(
      `${adminBase()}/students/${studentId}?error=${encodeURIComponent(
        "Enter a valid payment amount."
      )}`
    );
  }

  const studentFee = await prisma.studentFee.findUnique({
    where: { id: studentFeeId },
    include: { feeStructure: { select: { totalAmount: true } } },
  });
  if (!studentFee) {
    redirect(
      `${adminBase()}/students/${studentId}?error=${encodeURIComponent(
        "That fee record no longer exists."
      )}`
    );
  }

  const newPaidAmount = studentFee!.paidAmount + amount;
  const totalAmount = studentFee!.feeStructure.totalAmount;

  await prisma.$transaction([
    prisma.feePayment.create({
      data: {
        studentFeeId,
        studentId,
        amount,
        paymentMethod: paymentMethod as
          | "CASH"
          | "BANK_TRANSFER"
          | "CHEQUE"
          | "ONLINE",
        collectedBy: session.email,
      },
    }),
    prisma.studentFee.update({
      where: { id: studentFeeId },
      data: {
        paidAmount: newPaidAmount,
        remainingAmount: Math.max(0, totalAmount - newPaidAmount),
        status: computeStatus(newPaidAmount, totalAmount),
      },
    }),
  ]);

  revalidatePath(`${adminBase()}/students/${studentId}`);
  redirect(`${adminBase()}/students/${studentId}?paymentRecorded=1`);
}

// Removes a fee assignment - only allowed while no payments exist yet, so
// a bill that already has money recorded against it can't be silently
// wiped along with that payment history.
export async function deleteStudentFeeAction(formData: FormData) {
  await requireAdmin();
  const studentId = String(formData.get("studentId") ?? "");
  const studentFeeId = String(formData.get("studentFeeId") ?? "");
  if (!studentFeeId) return;

  const studentFee = await prisma.studentFee.findUnique({
    where: { id: studentFeeId },
    include: { _count: { select: { payments: true } } },
  });

  if (studentFee && studentFee._count.payments > 0) {
    revalidatePath(`${adminBase()}/students/${studentId}`);
    redirect(
      `${adminBase()}/students/${studentId}?error=${encodeURIComponent(
        "Can't remove this fee - payments have already been recorded against it."
      )}`
    );
  }

  await prisma.studentFee.delete({ where: { id: studentFeeId } }).catch(() => {});

  revalidatePath(`${adminBase()}/students/${studentId}`);
  redirect(`${adminBase()}/students/${studentId}?feeRemoved=1`);
}

// Deletes a single payment and reverses it out of the running total -
// for correcting a payment that was recorded by mistake.
export async function deletePaymentAction(formData: FormData) {
  await requireAdmin();
  const studentId = String(formData.get("studentId") ?? "");
  const paymentId = String(formData.get("paymentId") ?? "");
  if (!paymentId) return;

  const payment = await prisma.feePayment.findUnique({
    where: { id: paymentId },
    include: {
      studentFee: { include: { feeStructure: { select: { totalAmount: true } } } },
    },
  });
  if (!payment) return;

  const newPaidAmount = Math.max(0, payment.studentFee.paidAmount - payment.amount);
  const totalAmount = payment.studentFee.feeStructure.totalAmount;

  await prisma.$transaction([
    prisma.feePayment.delete({ where: { id: paymentId } }),
    prisma.studentFee.update({
      where: { id: payment.studentFeeId },
      data: {
        paidAmount: newPaidAmount,
        remainingAmount: Math.max(0, totalAmount - newPaidAmount),
        status: computeStatus(newPaidAmount, totalAmount),
      },
    }),
  ]);

  revalidatePath(`${adminBase()}/students/${studentId}`);
  redirect(`${adminBase()}/students/${studentId}?paymentRemoved=1`);
}
