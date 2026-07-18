import { getSession } from "@/lib/auth";
import { getStudentPortalData, getStaffPortalData } from "@/lib/queries/portal";

export const dynamic = "force-dynamic";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function PortalPage() {
  const session = await getSession();
  if (!session) return null;

  if (session.role === "STUDENT") {
    const data = await getStudentPortalData(session.userId);

    if (!data) {
      return (
        <div className="panel">
          <p className="panel-empty">
            No student profile is linked to this account yet. Contact the
            registrar's office.
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="main-header">
          <div className="main-eyebrow">{data.profile.rollNumber}</div>
          <h1 className="main-title">{data.profile.name}</h1>
        </div>
        <hr className="ledger-rule" />

        <div className="record-grid">
          <div className="record-card">
            <span className="record-code">FEE-01</span>
            <div className="record-label">Total due</div>
            <div
              className={`record-value ${
                data.fees.totalDue > 0 ? "rust" : "good"
              }`}
            >
              {formatCurrency(data.fees.totalDue)}
            </div>
          </div>

          <div className="record-card">
            <span className="record-code">ATT-01</span>
            <div className="record-label">Attendance (last 30 records)</div>
            <div className="record-value">
              {data.attendance.last30DaysPercent}%
            </div>
          </div>

          <div className="record-card">
            <span className="record-code">DEP-01</span>
            <div className="record-label">Department</div>
            <div className="record-value" style={{ fontSize: 18 }}>
              {data.profile.department}
            </div>
          </div>
        </div>

        <div className="panel">
          <h2 className="panel-title">Fee items</h2>
          {data.fees.items.length === 0 ? (
            <p className="panel-empty">No fee items on record.</p>
          ) : (
            data.fees.items.map((fee: (typeof data.fees.items)[number]) => (
              <div className="panel-row" key={fee.id}>
                <span className="panel-row-title">
                  {fee.feeStructure.name}
                </span>
                <span>
                  <span
                    className={`status-pill ${
                      fee.status === "PAID"
                        ? "good"
                        : fee.status === "OVERDUE"
                        ? "rust"
                        : "neutral"
                    }`}
                  >
                    {fee.status}
                  </span>{" "}
                  <span className="panel-row-meta">
                    {formatCurrency(fee.remainingAmount)} remaining
                  </span>
                </span>
              </div>
            ))
          )}
        </div>

        <div className="panel">
          <h2 className="panel-title">Upcoming exams</h2>
          {data.upcomingExams.length === 0 ? (
            <p className="panel-empty">No upcoming exams scheduled.</p>
          ) : (
            data.upcomingExams.map((exam: (typeof data.upcomingExams)[number]) => (
              <div className="panel-row" key={exam.id}>
                <span className="panel-row-title">
                  {exam.title} — {exam.course.name}
                </span>
                <span className="panel-row-meta">
                  {new Date(exam.scheduledAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="panel">
          <h2 className="panel-title">Recent attendance</h2>
          {data.attendance.recent.length === 0 ? (
            <p className="panel-empty">No attendance recorded yet.</p>
          ) : (
            data.attendance.recent.map((a: (typeof data.attendance.recent)[number]) => (
              <div className="panel-row" key={a.id}>
                <span className="panel-row-title">
                  {new Date(a.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
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
              </div>
            ))
          )}
        </div>
      </>
    );
  }

  // Staff / teacher / librarian / warden / accountant view
  const data = await getStaffPortalData(session.userId);

  if (!data) {
    return (
      <div className="panel">
        <p className="panel-empty">
          No staff profile is linked to this account yet. Contact the
          registrar's office.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">{data.profile.employeeCode}</div>
        <h1 className="main-title">{data.profile.name}</h1>
      </div>
      <hr className="ledger-rule" />

      <div className="record-grid">
        <div className="record-card">
          <span className="record-code">STF-01</span>
          <div className="record-label">Designation</div>
          <div className="record-value" style={{ fontSize: 18 }}>
            {data.profile.designation}
          </div>
        </div>

        <div className="record-card">
          <span className="record-code">DEP-01</span>
          <div className="record-label">Department</div>
          <div className="record-value" style={{ fontSize: 18 }}>
            {data.profile.department}
          </div>
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title">Weekly timetable</h2>
        {data.timetableByDay.every((d) => d.periods.length === 0) ? (
          <p className="panel-empty">No classes assigned yet.</p>
        ) : (
          data.timetableByDay.map((d: (typeof data.timetableByDay)[number]) =>
            d.periods.length === 0 ? null : (
              <div key={d.day} style={{ marginBottom: 14 }}>
                <div
                  className="main-eyebrow"
                  style={{ marginBottom: 6, marginTop: 10 }}
                >
                  {d.day}
                </div>
                {d.periods.map((p: (typeof d.periods)[number]) => (
                  <div className="panel-row" key={p.id}>
                    <span className="panel-row-title">
                      {p.course.name} — {p.class.name}
                      {p.class.section ? ` (${p.class.section})` : ""}
                    </span>
                    <span className="panel-row-meta">
                      {p.startTime} - {p.endTime}
                    </span>
                  </div>
                ))}
              </div>
            )
          )
        )}
      </div>
    </>
  );
}
