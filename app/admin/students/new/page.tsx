import { prisma } from "@/lib/prisma";
import { createStudentAction } from "@/lib/actions/student-admin";
import { getClassOptions } from "@/lib/queries/admin-lists";
import { getAdminRoute } from "@/lib/auth";
import { StudentForm } from "@/app/admin/_components/student-form";

export const dynamic = "force-dynamic";

export default async function NewStudentPage() {
  const [departments, classes] = await Promise.all([
    prisma.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    getClassOptions(),
  ]);

  const base = `/${getAdminRoute()}`;

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Records / Students</div>
        <h1 className="main-title">Add student</h1>
      </div>
      <hr className="ledger-rule" />

      <div className="panel" style={{ maxWidth: 640 }}>
        <StudentForm
          departments={departments}
          classes={classes}
          action={createStudentAction}
          mode="create"
          cancelHref={`${base}/students`}
        />
      </div>
    </>
  );
}
