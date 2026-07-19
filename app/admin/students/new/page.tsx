import { prisma } from "@/lib/prisma";
import { createStudentAction } from "@/lib/actions/student-admin";
import { StudentCreateForm } from "@/app/admin/_components/student-form";

export const dynamic = "force-dynamic";

export default async function NewStudentPage() {
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Records / Students</div>
        <h1 className="main-title">Add student</h1>
      </div>
      <hr className="ledger-rule" />

      <div className="panel" style={{ maxWidth: 560 }}>
        <StudentCreateForm departments={departments} action={createStudentAction} />
      </div>
    </>
  );
}
