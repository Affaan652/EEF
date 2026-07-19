import { prisma } from "@/lib/prisma";

// ============================================================
// PORTAL QUERIES
//
// Security note: every query here is scoped by the caller's own
// userId (taken from the verified session, never from a request
// parameter). There is no query in this file that accepts an
// arbitrary studentId/staffId from outside - that is what keeps a
// logged-in student from ever being able to read another
// student's fees or attendance by guessing an id.
// ============================================================

export async function getStudentPortalData(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      department: { select: { name: true } },
      classes: {
        where: { isActive: true },
        include: {
          class: {
            include: {
              exams: {
                where: { isPublished: true },
                orderBy: { scheduledAt: "asc" },
                include: { course: { select: { name: true, code: true } } },
              },
            },
          },
        },
      },
      feeStructures: {
        include: { feeStructure: { select: { name: true, dueDate: true } } },
        orderBy: { dueDate: "desc" },
      },
      attendances: {
        orderBy: { date: "desc" },
        take: 30,
      },
    },
  });

  if (!student) return null;

  const now = new Date();
  const upcomingExams = student.classes
    .flatMap((sc) => sc.class.exams)
    .filter((exam) => new Date(exam.scheduledAt) >= now)
    .slice(0, 5);

  const totalDue = student.feeStructures.reduce(
    (sum, fee) => sum + fee.remainingAmount,
    0
  );

  const presentCount = student.attendances.filter(
    (a) => a.status === "PRESENT"
  ).length;
  const attendancePercent = student.attendances.length
    ? Math.round((presentCount / student.attendances.length) * 100)
    : 0;

  return {
    profile: {
      name: `${student.firstName} ${student.lastName}`,
      rollNumber: student.rollNumber,
      department: student.department?.name ?? "Unassigned",
    },
    fees: {
      totalDue,
      items: student.feeStructures,
    },
    attendance: {
      last30DaysPercent: attendancePercent,
      recent: student.attendances.slice(0, 10),
    },
    upcomingExams,
  };
}
