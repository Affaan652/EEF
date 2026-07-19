import { prisma } from "@/lib/prisma";

// Each function here fetches a bounded, ordered slice of records for an
// admin list page. These are read-only overview lists (no search/pagination
// yet) - enough to see what's in the system and confirm data is flowing in,
// which is the first thing an admin needs before deeper editing screens.

const LIST_LIMIT = 100;

export async function getStudentsList() {
  return prisma.student.findMany({
    take: LIST_LIMIT,
    orderBy: { createdAt: "desc" },
    include: { department: { select: { name: true } } },
  });
}

export async function getStaffList() {
  return prisma.staff.findMany({
    take: LIST_LIMIT,
    orderBy: { createdAt: "desc" },
    include: { department: { select: { name: true } } },
  });
}

export async function getAdmissionsList() {
  return prisma.admissionApplication.findMany({
    take: LIST_LIMIT,
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeeStructuresList() {
  const structures = await prisma.feeStructure.findMany({
    take: LIST_LIMIT,
    orderBy: { dueDate: "desc" },
    include: {
      academicYear: { select: { label: true } },
      _count: { select: { studentFees: true } },
    },
  });

  const [totalCollected, totalOutstanding] = await Promise.all([
    prisma.feePayment.aggregate({ _sum: { amount: true } }),
    prisma.studentFee.aggregate({
      _sum: { remainingAmount: true },
      where: { status: { in: ["UNPAID", "PARTIALLY_PAID", "OVERDUE"] } },
    }),
  ]);

  return {
    structures,
    totalCollected: totalCollected._sum.amount ?? 0,
    totalOutstanding: totalOutstanding._sum.remainingAmount ?? 0,
  };
}

export async function getPayrollList() {
  return prisma.payrollLog.findMany({
    take: LIST_LIMIT,
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: {
      staff: { select: { firstName: true, lastName: true, employeeCode: true } },
    },
  });
}

export async function getClassesList() {
  return prisma.class.findMany({
    take: LIST_LIMIT,
    orderBy: { createdAt: "desc" },
    include: {
      academicYear: { select: { label: true } },
      classroom: { select: { name: true, building: true } },
      _count: { select: { students: true } },
    },
  });
}

export async function getExamsList() {
  return prisma.exam.findMany({
    take: LIST_LIMIT,
    orderBy: { scheduledAt: "desc" },
    include: {
      course: { select: { name: true, code: true } },
      class: { select: { name: true, section: true } },
    },
  });
}

export async function getAttendanceOverview() {
  const today = new Date(new Date().toDateString());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const [todayByClass, recent] = await Promise.all([
    prisma.attendance.groupBy({
      by: ["classId", "status"],
      _count: { id: true },
      where: { date: { gte: today, lt: tomorrow } },
    }),
    prisma.attendance.findMany({
      take: LIST_LIMIT,
      orderBy: { date: "desc" },
      include: {
        student: { select: { firstName: true, lastName: true, rollNumber: true } },
        class: { select: { name: true, section: true } },
      },
    }),
  ]);

  const classIds = Array.from(new Set(todayByClass.map((r) => r.classId)));
  const classes = classIds.length
    ? await prisma.class.findMany({
        where: { id: { in: classIds } },
        select: { id: true, name: true, section: true },
      })
    : [];

  const classNameById = Object.fromEntries(
    classes.map((c) => [c.id, `${c.name}${c.section ? ` (${c.section})` : ""}`])
  );

  const summaryByClass = classIds.map((id) => {
    const rows = todayByClass.filter((r) => r.classId === id);
    const present = rows.find((r) => r.status === "PRESENT")?._count.id ?? 0;
    const absent = rows.find((r) => r.status === "ABSENT")?._count.id ?? 0;
    return { classId: id, className: classNameById[id] ?? "Unknown class", present, absent };
  });

  return { summaryByClass, recent };
}
