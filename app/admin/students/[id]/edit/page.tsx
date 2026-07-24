import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateStudentAction } from "@/lib/actions/student-admin";
import { getClassOptions } from "@/lib/queries/admin-lists";
import { StudentForm } from "@/app/admin/_components/student-form";

export const dynamic = "force-dynamic";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function EditStudentPage({
  params,
}: {
  params: { id: string };
}) {
  const [student, departments, classes] = await Promise.all([
    prisma.student.findUnique({
      where: { id: params.id },
      include: {
        classes: {
          where: { isActive: true },
          take: 1,
          select: { classId: true },
        },
      },
    }),
    prisma.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    getClassOptions(),
  ]);

  if (!student) {
    notFound();
  }

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Records / Students</div>
        <h1 className="main-title">
          Edit {student.firstName} {student.lastName}
        </h1>
      </div>
      <hr className="ledger-rule" />

      <div className="panel" style={{ maxWidth: 640 }}>
        <StudentForm
          departments={departments}
          classes={classes}
          action={updateStudentAction}
          mode="edit"
          defaults={{
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            rollNumber: student.rollNumber,
            dateOfBirth: toDateInputValue(student.dateOfBirth),
            gender: student.gender,
            email: student.email,
            phone: student.phone,
            whatsappNumber: student.whatsappNumber,
            guardianName: student.guardianName,
            guardianPhone: student.guardianPhone,
            departmentId: student.departmentId,
            classId: student.classes[0]?.classId ?? null,
          }}
        />
      </div>
    </>
  );
}
