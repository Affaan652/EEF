import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteStudentAction } from "@/lib/actions/student-admin";
import { getAdminRoute } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ViewStudentPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { updated?: string };
}) {
  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      department: { select: { name: true } },
      classes: {
        where: { isActive: true },
        take: 1,
        include: {
          class: {
            select: {
              name: true,
              section: true,
              academicYear: { select: { label: true } },
            },
          },
        },
      },
    },
  });

  if (!student) {
    notFound();
  }

  const base = `/${getAdminRoute()}`;
  const currentClass = student.classes[0]?.class;

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Records / Students</div>
        <h1 className="main-title">
          {student.firstName} {student.lastName}
        </h1>
      </div>
      <hr className="ledger-rule" />

      {searchParams.updated && (
        <div className="banner banner-good">Student record updated.</div>
      )}

      <div className="panel" style={{ maxWidth: 640 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <h2 className="panel-title" style={{ margin: 0 }}>
            Profile
          </h2>
          <Link
            href={`${base}/students/${student.id}/edit`}
            className="btn-ghost btn-small"
          >
            Edit
          </Link>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Roll number</span>
          <span className="panel-row-meta">{student.rollNumber}</span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Gender</span>
          <span className="panel-row-meta">{student.gender}</span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Date of birth</span>
          <span className="panel-row-meta">
            {new Date(student.dateOfBirth).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Department</span>
          <span className="panel-row-meta">
            {student.department?.name ?? "Unassigned"}
          </span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Class</span>
          <span className="panel-row-meta">
            {currentClass
              ? `${currentClass.name}${
                  currentClass.section ? ` - ${currentClass.section}` : ""
                } (${currentClass.academicYear.label})`
              : "Not assigned"}
          </span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Admitted</span>
          <span className="panel-row-meta">
            {new Date(student.admissionDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: 640 }}>
        <h2 className="panel-title">Contact</h2>
        <div className="panel-row">
          <span className="panel-row-title">Email</span>
          <span className="panel-row-meta">{student.email ?? "Not provided"}</span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Phone</span>
          <span className="panel-row-meta">{student.phone ?? "Not provided"}</span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">WhatsApp</span>
          <span className="panel-row-meta">
            {student.whatsappNumber ?? "Not provided"}
          </span>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: 640 }}>
        <h2 className="panel-title">Guardian</h2>
        <div className="panel-row">
          <span className="panel-row-title">Name</span>
          <span className="panel-row-meta">
            {student.guardianName ?? "Not provided"}
          </span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Phone</span>
          <span className="panel-row-meta">
            {student.guardianPhone ?? "Not provided"}
          </span>
        </div>
      </div>

      <div className="panel panel-danger" style={{ maxWidth: 640 }}>
        <h2 className="panel-title">Delete record</h2>
        <p className="field-hint">
          This removes the student record. If the student has linked fees or
          attendance, deletion is blocked until those are cleared. This
          cannot be undone.
        </p>
        <form action={deleteStudentAction}>
          <input type="hidden" name="studentId" value={student.id} />
          <button type="submit" className="btn-danger">
            Delete student record
          </button>
        </form>
      </div>
    </>
  );
}
