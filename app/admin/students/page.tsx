import { getStudentsList } from "@/lib/queries/admin-lists";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const students = await getStudentsList();

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Records</div>
        <h1 className="main-title">Students</h1>
      </div>
      <hr className="ledger-rule" />

      <div className="table-toolbar">
        <span className="table-count">{students.length} student(s)</span>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll no.</th>
              <th>Name</th>
              <th>Department</th>
              <th>Admitted</th>
              <th>Status</th>
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
                    <span
                      className={`status-pill ${s.isActive ? "good" : "neutral"}`}
                    >
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
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
