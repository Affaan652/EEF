import { getStaffList } from "@/lib/queries/admin-lists";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const staff = await getStaffList();

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Records</div>
        <h1 className="main-title">Staff</h1>
      </div>
      <hr className="ledger-rule" />

      <div className="table-toolbar">
        <span className="table-count">{staff.length} staff member(s)</span>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee code</th>
              <th>Name</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Joined</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan={6} className="meta">
                  No staff on record yet.
                </td>
              </tr>
            ) : (
              staff.map((s: (typeof staff)[number]) => (
                <tr key={s.id}>
                  <td>{s.employeeCode}</td>
                  <td>
                    {s.firstName} {s.lastName}
                  </td>
                  <td className="meta">{s.designation}</td>
                  <td className="meta">{s.department?.name ?? "Unassigned"}</td>
                  <td className="meta">
                    {new Date(s.joinDate).toLocaleDateString("en-GB", {
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
