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

const VALID_STATUSES = ["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const;

// Marks (or re-marks) attendance for every student in one class on one
// date in a single submit. Each student's status comes in as a form field
// named "status_<studentId>". Re-submitting for the same class+date
// overwrites the existing records rather than duplicating them - marking
// attendance again is how a mistake gets corrected.
export async function markAttendanceAction(formData: FormData) {
  const session = await requireAdmin();

  const classId = String(formData.get("classId") ?? "");
  const dateRaw = String(formData.get("date") ?? "");
  if (!classId || !dateRaw) {
    redirect(
      `${adminBase()}/attendance/mark?error=${encodeURIComponent(
        "Choose a class and a date."
      )}`
    );
  }

  const date = new Date(dateRaw);
  if (Number.isNaN(date.getTime())) {
    redirect(
      `${adminBase()}/attendance/mark?error=${encodeURIComponent(
        "Enter a valid date."
      )}`
    );
  }

  const studentIds = formData.getAll("studentId").map(String);

  for (const studentId of studentIds) {
    const status = String(formData.get(`status_${studentId}`) ?? "PRESENT");
    if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      continue;
    }

    await prisma.attendance.upsert({
      where: {
        studentId_classId_date: { studentId, classId, date },
      },
      update: {
        status: status as (typeof VALID_STATUSES)[number],
        markedBy: session.email,
      },
      create: {
        studentId,
        classId,
        date,
        status: status as (typeof VALID_STATUSES)[number],
        markedBy: session.email,
      },
    });
  }

  revalidatePath(`${adminBase()}/attendance`);
  redirect(
    `${adminBase()}/attendance/mark?classId=${classId}&date=${dateRaw}&saved=1`
  );
}

export async function deleteAttendanceAction(formData: FormData) {
  await requireAdmin();
  const attendanceId = String(formData.get("attendanceId") ?? "");
  if (!attendanceId) return;

  await prisma.attendance.delete({ where: { id: attendanceId } }).catch(() => {
    // Already gone - nothing to do.
  });

  revalidatePath(`${adminBase()}/attendance`);
  redirect(`${adminBase()}/attendance?deleted=1`);
}
