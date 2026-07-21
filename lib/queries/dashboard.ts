// ============================================================
// DASHBOARD QUERIES & SYSTEM LOGIC
// File: lib/queries/dashboard.ts
// ============================================================

import { prisma } from "@/lib/prisma";
import { AdmissionStatus, FeeStatus, AttendanceStatus } from "@prisma/client";
import { sendEmail } from "@/lib/email";

// ============================================================
// 1. EXECUTIVE DASHBOARD - CORE METRICS
//    All queries run in parallel via Promise.all for performance
// ============================================================

export async function getDashboardMetrics() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalStudents,
    pendingAdmissions,
    enrolledThisMonth,
    feeCollection,
    attendanceToday,
    overdueFees,
    upcomingExams,
  ] = await Promise.all([
    // 1a. Total students on record
    prisma.student.count(),

    // 1b. Pending admissions (grouped by status)
    prisma.admissionApplication.groupBy({
      by: ["status"],
      _count: { id: true },
      where: {
        status: {
          in: [
            AdmissionStatus.SUBMITTED,
            AdmissionStatus.UNDER_REVIEW,
            AdmissionStatus.DOCUMENTS_PENDING,
          ],
        },
      },
    }),

    // 1c. New enrollments this month
    prisma.student.count({
      where: {
        admissionDate: { gte: startOfMonth },
      },
    }),

    // 1d. Fee collection this month
    prisma.feePayment.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      where: {
        paidAt: { gte: startOfMonth },
      },
    }),

    // 1e. Today's attendance summary
    prisma.attendance.groupBy({
      by: ["status"],
      _count: { id: true },
      where: {
        date: {
          gte: new Date(today.toDateString()),
          lt: new Date(
            new Date(today.toDateString()).getTime() + 24 * 60 * 60 * 1000
          ),
        },
      },
    }),

    // 1f. Overdue fees count
    prisma.studentFee.count({
      where: {
        status: FeeStatus.OVERDUE,
      },
    }),

    // 1g. Upcoming exams (next 7 days)
    prisma.exam.findMany({
      take: 5,
      where: {
        scheduledAt: {
          gte: today,
          lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
        isPublished: true,
      },
      orderBy: { scheduledAt: "asc" },
      include: {
        course: { select: { name: true, code: true } },
        class: { select: { name: true, section: true } },
      },
    }),
  ]);

  // Compute derived values
  const pendingAdmissionCount = pendingAdmissions.reduce(
    (sum, g) => sum + g._count.id,
    0
  );

  const attendanceMap = Object.fromEntries(
    attendanceToday.map((a) => [a.status, a._count.id])
  );
  const attendanceRate =
    attendanceMap[AttendanceStatus.PRESENT] && totalStudents
      ? Math.round(
          (attendanceMap[AttendanceStatus.PRESENT] / totalStudents) * 100
        )
      : 0;

  return {
    students: {
      total: totalStudents,
      newThisMonth: enrolledThisMonth,
    },
    admissions: {
      pending: pendingAdmissionCount,
      breakdown: pendingAdmissions,
    },
    fees: {
      collectedThisMonth: feeCollection._sum.amount ?? 0,
      transactionsThisMonth: feeCollection._count.id,
      overdueFees,
    },
    attendance: {
      todayRate: attendanceRate,
      present: attendanceMap[AttendanceStatus.PRESENT] ?? 0,
      absent: attendanceMap[AttendanceStatus.ABSENT] ?? 0,
    },
    upcomingExams,
  };
}

// ============================================================
// 2. FEE COLLECTION CHART DATA (last 6 months)
// ============================================================

export async function getFeeCollectionChart() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const payments = await prisma.feePayment.findMany({
    where: { paidAt: { gte: sixMonthsAgo } },
    select: { amount: true, paidAt: true },
  });

  // Group by month in JS (avoids raw SQL for portability)
  const monthlyMap: Record<string, number> = {};
  for (const p of payments) {
    const key = `${p.paidAt.getFullYear()}-${String(
      p.paidAt.getMonth() + 1
    ).padStart(2, "0")}`;
    monthlyMap[key] = (monthlyMap[key] ?? 0) + p.amount;
  }

  return Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }));
}

// ============================================================
// 3. ADMISSION PIPELINE FUNNEL
// ============================================================

export async function getAdmissionFunnel() {
  const grouped = await prisma.admissionApplication.groupBy({
    by: ["status"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  return grouped.map((g) => ({
    status: g.status,
    count: g._count.id,
  }));
}

// ============================================================
// 4. ADMISSION MANAGEMENT - PAGINATED LIST
// ============================================================

export async function getAdmissionApplications(
  page = 1,
  pageSize = 20,
  status?: AdmissionStatus,
  search?: string
) {
  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { applicationNumber: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [applications, total] = await Promise.all([
    prisma.admissionApplication.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.admissionApplication.count({ where }),
  ]);

  return {
    applications,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ============================================================
// 5. UPDATE ADMISSION STATUS + EMAIL THE APPLICANT
// ============================================================

export async function updateAdmissionStatus(
  applicationId: string,
  status: AdmissionStatus,
  reviewedBy: string,
  rejectionNote?: string
) {
  const application = await prisma.admissionApplication.update({
    where: { id: applicationId },
    data: {
      status,
      reviewedBy,
      reviewedAt: new Date(),
      rejectionNote: rejectionNote ?? null,
      enrolledAt: status === AdmissionStatus.ENROLLED ? new Date() : undefined,
    },
  });

  // Best-effort: the status update already succeeded, so an email hiccup
  // should never roll back the review decision.
  await notifyApplicant(application);

  return application;
}

async function notifyApplicant(application: {
  id: string;
  email: string;
  status: AdmissionStatus;
  firstName: string;
}) {
  const messages: Record<string, string> = {
    APPROVED: `Congratulations ${application.firstName}! Your application has been approved.`,
    REJECTED: `Dear ${application.firstName}, we regret to inform you that your application was not successful.`,
    DOCUMENTS_PENDING: `Dear ${application.firstName}, please submit your pending documents to proceed.`,
    ENROLLED: `Welcome ${application.firstName}! Your enrollment is confirmed.`,
  };

  const message = messages[application.status];
  if (!message) return;

  await sendEmail({
    to: application.email,
    subject: `Application update - ${application.status}`,
    html: `<p>${message}</p>`,
  });
}

// ============================================================
// 6. FEE STRUCTURE ASSIGNMENT TO BATCH
// ============================================================

export async function assignFeeStructureToClass(
  classId: string,
  feeStructureId: string
) {
  const students = await prisma.studentClass.findMany({
    where: { classId, isActive: true },
    select: { studentId: true },
  });

  const feeStructure = await prisma.feeStructure.findUnique({
    where: { id: feeStructureId },
  });

  if (!feeStructure) throw new Error("Fee structure not found");

  const upserts = students.map((sc) =>
    prisma.studentFee.upsert({
      where: {
        studentId_feeStructureId: {
          studentId: sc.studentId,
          feeStructureId,
        },
      },
      create: {
        studentId: sc.studentId,
        feeStructureId,
        status: FeeStatus.UNPAID,
        dueDate: feeStructure.dueDate,
        paidAmount: 0,
        remainingAmount: feeStructure.totalAmount,
      },
      update: {},
    })
  );

  await prisma.$transaction(upserts);

  return { assigned: students.length };
}

// ============================================================
// 7. ATTENDANCE MARK IN BULK
// ============================================================

export async function markBulkAttendance(
  classId: string,
  date: Date,
  markedBy: string,
  records: Array<{ studentId: string; status: AttendanceStatus; note?: string }>
) {
  const upserts = records.map((r) =>
    prisma.attendance.upsert({
      where: {
        studentId_classId_date: {
          studentId: r.studentId,
          classId,
          date,
        },
      },
      create: {
        studentId: r.studentId,
        classId,
        date,
        status: r.status,
        markedBy,
        note: r.note,
      },
      update: {
        status: r.status,
        markedBy,
        note: r.note,
      },
    })
  );

  await prisma.$transaction(upserts);

  return { marked: records.length };
}
