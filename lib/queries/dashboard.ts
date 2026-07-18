// ============================================================
// DASHBOARD QUERIES & SYSTEM LOGIC
// File: lib/queries/dashboard.ts
// ============================================================

import { prisma } from "@/lib/prisma";
import { AdmissionStatus, FeeStatus, AttendanceStatus } from "@prisma/client";

// ============================================================
// 1. EXECUTIVE DASHBOARD - CORE METRICS
//    All queries run in parallel via Promise.all for performance
// ============================================================

export async function getDashboardMetrics() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  const [
    totalActiveStudents,
    totalActiveStaff,
    pendingAdmissions,
    enrolledThisMonth,
    feeCollection,
    attendanceToday,
    overdueFees,
    recentActivities,
    upcomingExams,
    announcements,
  ] = await Promise.all([

    // 1a. Total active students
    prisma.student.count({
      where: { isActive: true },
    }),

    // 1b. Total active staff
    prisma.staff.count({
      where: { isActive: true },
    }),

    // 1c. Pending admissions (grouped by status)
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

    // 1d. New enrollments this month
    prisma.student.count({
      where: {
        admissionDate: { gte: startOfMonth },
      },
    }),

    // 1e. Fee collection this month
    prisma.feePayment.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      where: {
        paidAt: { gte: startOfMonth },
      },
    }),

    // 1f. Today's attendance summary
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

    // 1g. Overdue fees count
    prisma.studentFee.count({
      where: {
        status: FeeStatus.OVERDUE,
      },
    }),

    // 1h. Recent activity log (last 10 actions)
    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            student: { select: { firstName: true, lastName: true } },
            staff: { select: { firstName: true, lastName: true } },
          },
        },
      },
    }),

    // 1i. Upcoming exams (next 7 days)
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

    // 1j. Active pinned announcements
    prisma.announcement.findMany({
      take: 5,
      where: {
        isPinned: true,
        publishedAt: { lte: today },
        OR: [{ expiresAt: null }, { expiresAt: { gte: today } }],
      },
      orderBy: { createdAt: "desc" },
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
    attendanceMap[AttendanceStatus.PRESENT] && totalActiveStudents
      ? Math.round(
          (attendanceMap[AttendanceStatus.PRESENT] / totalActiveStudents) * 100
        )
      : 0;

  return {
    students: {
      total: totalActiveStudents,
      newThisMonth: enrolledThisMonth,
    },
    staff: {
      total: totalActiveStaff,
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
    recentActivities,
    upcomingExams,
    announcements,
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
// 5. UPDATE ADMISSION STATUS + TRIGGER NOTIFICATION
// ============================================================

export async function updateAdmissionStatus(
  applicationId: string,
  status: AdmissionStatus,
  reviewedBy: string,
  rejectionNote?: string
) {
  const [application] = await prisma.$transaction([
    prisma.admissionApplication.update({
      where: { id: applicationId },
      data: {
        status,
        reviewedBy,
        reviewedAt: new Date(),
        rejectionNote: rejectionNote ?? null,
        enrolledAt: status === AdmissionStatus.ENROLLED ? new Date() : undefined,
      },
    }),
    prisma.activityLog.create({
      data: {
        userId: reviewedBy,
        action: `ADMISSION_${status}`,
        entity: "AdmissionApplication",
        entityId: applicationId,
        metadata: { status, rejectionNote },
      },
    }),
  ]);

  // Queue notification (implement with a job queue in production)
  await queueNotification(application);

  return application;
}

async function queueNotification(application: {
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

  const msg = messages[application.status];
  if (!msg) return;

  await prisma.notification.create({
    data: {
      applicationId: application.id,
      type: "EMAIL",
      status: "PENDING",
      subject: `Application Update - ${application.status}`,
      message: msg,
      recipient: application.email,
    },
  });
}

// ============================================================
// 6. STUDENT REPORT CARD GENERATOR
// ============================================================

export async function generateReportCard(studentId: string, academicYearId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      classes: {
        where: { isActive: true },
        include: {
          class: {
            include: {
              exams: {
                where: { academicYearId, isPublished: true },
                include: {
                  course: true,
                  marks: { where: { studentId } },
                },
              },
            },
          },
        },
      },
      attendances: {
        where: {
          class: { academicYearId },
        },
      },
    },
  });

  if (!student) throw new Error("Student not found");

  // Compute per-course aggregates
  const courseResults: Record<
    string,
    { courseName: string; totalMarks: number; obtained: number; grade: string }
  > = {};

  for (const sc of student.classes) {
    for (const exam of sc.class.exams) {
      const mark = exam.marks[0];
      if (!mark) continue;
      const key = exam.courseId;
      if (!courseResults[key]) {
        courseResults[key] = {
          courseName: exam.course.name,
          totalMarks: 0,
          obtained: 0,
          grade: "",
        };
      }
      courseResults[key].totalMarks += exam.totalMarks;
      courseResults[key].obtained += mark.obtained;
    }
  }

  // Assign grades
  for (const key of Object.keys(courseResults)) {
    const r = courseResults[key];
    const pct = (r.obtained / r.totalMarks) * 100;
    r.grade =
      pct >= 90 ? "A+" :
      pct >= 80 ? "A"  :
      pct >= 70 ? "B"  :
      pct >= 60 ? "C"  :
      pct >= 50 ? "D"  : "F";
  }

  // Attendance summary
  const totalDays = student.attendances.length;
  const presentDays = student.attendances.filter(
    (a) => a.status === AttendanceStatus.PRESENT
  ).length;

  return {
    student: {
      rollNumber: student.rollNumber,
      name: `${student.firstName} ${student.lastName}`,
    },
    courseResults: Object.values(courseResults),
    attendance: {
      totalDays,
      presentDays,
      percentage: totalDays ? Math.round((presentDays / totalDays) * 100) : 0,
    },
    generatedAt: new Date(),
  };
}

// ============================================================
// 7. FEE STRUCTURE ASSIGNMENT TO BATCH
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
// 8. CAMPUS CALENDAR - UPCOMING EVENTS
// ============================================================

export async function getUpcomingEvents(days = 30) {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return prisma.campusCalendarEvent.findMany({
    where: {
      startDate: { gte: now },
      endDate: { lte: future },
    },
    orderBy: { startDate: "asc" },
  });
}

// ============================================================
// 9. TIMETABLE FOR A CLASS
// ============================================================

export async function getClassTimetable(classId: string, academicYearId: string) {
  const timetable = await prisma.timetable.findMany({
    where: { classId, academicYearId, isActive: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    include: {
      course: { select: { name: true, code: true } },
      staff: { select: { firstName: true, lastName: true } },
      classroom: { select: { name: true, building: true } },
    },
  });

  // Group by day
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const grouped = days.map((day, i) => ({
    day,
    periods: timetable.filter((t) => t.dayOfWeek === i),
  }));

  return grouped;
}

// ============================================================
// 10. ATTENDANCE MARK IN BULK (Teacher API)
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
