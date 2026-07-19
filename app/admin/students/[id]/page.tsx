import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteStudentAction } from "@/lib/actions/student-admin";

export const dynamic = "force-dynamic";

export default async function ManageStudentPage({
  params,
}: {
  params: { id: string };
}) {
  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { email: true } },
      department: { select: { name: true } },
    },
  });

  if (!student) {
    notFound();
  }

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Records / Students</div>
        <h1 className="main-title">
          {student.firstName} {student.lastName}
        </h1>
      </div>
      <hr className="ledger-rule" />

      <div className="panel" style={{ maxWidth: 560 }}>
        <h2 className="panel-title">Profile</h2>
        <div className="panel-row">
          <span className="panel-row-title">Roll number</span>
          <span className="panel-row-meta">{student.rollNumber}</span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Email</span>
          <span className="panel-row-meta">{student.user.email}</span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Department</span>
          <span className="panel-row-meta">
            {student.department?.name ?? "Unassigned"}
          </span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Status</span>
          <span
            className={`status-pill ${student.isActive ? "good" : "neutral"}`}
          >
            {student.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="panel panel-danger" style={{ maxWidth: 560 }}>
        <h2 className="panel-title">Delete account</h2>
        <p className="field-hint">
          This removes the student record and its login. If the student has
          linked fees, marks, or attendance, deletion is blocked until those
          are cleared. This cannot be undone.
        </p>
        <form action={deleteStudentAction}>
          <input type="hidden" name="studentId" value={student.id} />
          <button type="submit" className="btn-danger">
            Delete student account
          </button>
        </form>
      </div>
    </>
  );
}
