import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// Each function here fetches a bounded, ordered slice of records for an
// admin list page. These are read-only overview lists (no search/pagination
// yet) - enough to see what's in the system and confirm data is flowing in,
// which is the first thing an admin needs before deeper editing screens.

const LIST_LIMIT = 100;

// Flat, filtered student list - used when the admin is searching by name/
// roll number and/or has picked a specific class and/or calendar year from
// the filters.
export async function getStudentsList(
  params: { q?: string; classId?: string; calendarYear?: string } = {}
) {
  const { q, classId, calendarYear } = params;

  const where: Prisma.StudentWhereInput = {};

  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { rollNumber: { contains: q, mode: "insensitive" } },
    ];
  }

  if (classId) {
    where.classes = { some: { classId, isActive: true } };
  }

  if (calendarYear) {
    const yearNum = Number(calendarYear);
    if (Number.isInteger(yearNum)) {
      // A student "was around" in this calendar year if it falls
      // anywhere within their enrolled yearStart..yearEnd span - this is
      // independent of the class filter above, so both can be applied
      // together (e.g. "Civil 1" students who were enrolled in 2025).
      where.yearStart = { lte: yearNum };
      where.yearEnd = { gte: yearNum };
    }
  }

  return prisma.student.findMany({
    where,
    take: LIST_LIMIT,
    orderBy: { createdAt: "desc" },
    include: {
      department: { select: { name: true } },
      classes: {
        where: { isActive: true },
        take: 1,
        include: { class: { select: { id: true, name: true, section: true } } },
      },
    },
  });
}

// Default students-page view (no search/filter applied yet): students
// grouped under their current class, so "each class gets its own row" of
// students rather than one long undifferentiated list. Students with no
// active class assignment are grouped under "Unassigned".
export async function getStudentsGroupedByClass() {
  const classes = await prisma.class.findMany({
    orderBy: [{ name: "asc" }, { section: "asc" }],
    include: {
      academicYear: { select: { label: true } },
      students: {
        where: { isActive: true },
        include: {
          student: {
            include: { department: { select: { name: true } } },
          },
        },
      },
    },
  });

  const unassigned = await prisma.student.findMany({
    where: { classes: { none: { isActive: true } } },
    orderBy: { createdAt: "desc" },
    include: { department: { select: { name: true } } },
  });

  return { classes, unassigned };
}

// For the class filter dropdown (students list) and the class-select
// field on the add/edit student form.
export async function getClassOptions() {
  return prisma.class.findMany({
    orderBy: [{ name: "asc" }, { section: "asc" }],
    select: {
      id: true,
      name: true,
      section: true,
      academicYear: { select: { label: true } },
    },
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

// For the "Mark attendance" page: every active student currently assigned
// to a class, along with whatever attendance status is already recorded
// for the chosen date (if any), so re-opening the page for a date that
// was already marked shows the existing marks instead of blanks.
export async function getClassStudentsWithAttendance(
  classId: string,
  date: Date
) {
  const studentClasses = await prisma.studentClass.findMany({
    where: { classId, isActive: true },
    include: {
      student: {
        select: { id: true, firstName: true, lastName: true, rollNumber: true },
      },
    },
    orderBy: { student: { rollNumber: "asc" } },
  });

  const existing = await prisma.attendance.findMany({
    where: { classId, date },
    select: { studentId: true, status: true },
  });
  const statusByStudent = Object.fromEntries(
    existing.map((a) => [a.studentId, a.status])
  );

  return studentClasses.map((sc) => ({
    ...sc.student,
    status: statusByStudent[sc.student.id] ?? "PRESENT",
  }));
}
