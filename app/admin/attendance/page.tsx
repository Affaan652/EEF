import { getAttendanceOverview } from "@/lib/queries/admin-lists";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const { summaryByClass, recent } = await getAttendanceOverview();

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Academics</div>
        <h1 className="main-title">Attendance</h1>
      </div>
      <hr className="ledger-rule" />

      <div className="panel">
        <h2 className="panel-title">Today, by class</h2>
        {summaryByClass.length === 0 ? (
          <p className="panel-empty">No attendance marked yet today.</p>
        ) : (
          summaryByClass.map((row: (typeof summaryByClass)[number]) => (
            <div className="panel-row" key={row.classId}>
              <span className="panel-row-title">{row.className}</span>
              <span className="panel-row-meta">
                {row.present} present, {row.absent} absent
              </span>
            </div>
          ))
        )}
      </div>

      <div className="table-toolbar">
        <span className="table-count">
          {recent.length} recent record(s)
        </span>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr>
                <td colSpan={4} className="meta">
                  No attendance recorded yet.
                </td>
              </tr>
            ) : (
              recent.map((a: (typeof recent)[number]) => (
                <tr key={a.id}>
                  <td>
                    {a.student.firstName} {a.student.lastName}
                    <div className="cell-meta">{a.student.rollNumber}</div>
                  </td>
                  <td className="meta">
                    {a.class.name}
                    {a.class.section ? ` (${a.class.section})` : ""}
                  </td>
                  <td className="meta">
                    {new Date(a.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        a.status === "PRESENT"
                          ? "good"
                          : a.status === "ABSENT"
                          ? "rust"
                          : "neutral"
                      }`}
                    >
                      {a.status}
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
