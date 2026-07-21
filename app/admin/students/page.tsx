import Link from "next/link";
import { getStudentsList } from "@/lib/queries/admin-lists";
import { getAdminRoute } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: { created?: string; deleted?: string; error?: string };
}) {
  const students = await getStudentsList();
  const base = `/${getAdminRoute()}`;

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Records</div>
        <h1 className="main-title">Students</h1>
      </div>
      <hr className="ledger-rule" />

      {searchParams.created && (
        <div className="banner banner-good">Student record added.</div>
      )}
      {searchParams.deleted && (
        <div className="banner banner-good">Student record deleted.</div>
      )}
      {searchParams.error && (
        <div className="banner banner-bad">{searchParams.error}</div>
      )}

      <div className="table-toolbar">
        <span className="table-count">{students.length} student(s)</span>
        <Link href={`${base}/students/new`} className="btn-primary btn-small">
          Add student
        </Link>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll no.</th>
              <th>Name</th>
              <th>Department</th>
              <th>Admitted</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} className="meta">
                  No students on record yet.
                </td>
              </tr>
            ) : (
              students.map((s: (typeof students)[number]) => (
                <tr key={s.id}>
                  <td>{s.rollNumber}</td>
                  <td>
                    {s.firstName} {s.lastName}
                  </td>
                  <td className="meta">{s.department?.name ?? "Unassigned"}</td>
                  <td className="meta">
                    {new Date(s.admissionDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <Link href={`${base}/students/${s.id}`} className="table-link">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
