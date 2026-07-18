import { getDashboardMetrics } from "@/lib/queries/dashboard";

export const dynamic = "force-dynamic";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Ledger as of {today}</div>
        <h1 className="main-title">Overview</h1>
      </div>
      <hr className="ledger-rule" />

      <div className="record-grid">
        <div className="record-card">
          <span className="record-code">STU-01</span>
          <div className="record-label">Active students</div>
          <div className="record-value">{metrics.students.total}</div>
          <div className="record-sub">
            {metrics.students.newThisMonth} enrolled this month
          </div>
        </div>

        <div className="record-card">
          <span className="record-code">STF-01</span>
          <div className="record-label">Active staff</div>
          <div className="record-value">{metrics.staff.total}</div>
        </div>

        <div className="record-card">
          <span className="record-code">ADM-01</span>
          <div className="record-label">Pending admissions</div>
          <div className="record-value">{metrics.admissions.pending}</div>
          <div className="record-sub">Submitted through under review</div>
        </div>

        <div className="record-card">
          <span className="record-code">FEE-01</span>
          <div className="record-label">Collected this month</div>
          <div className="record-value good">
            {formatCurrency(metrics.fees.collectedThisMonth)}
          </div>
          <div className="record-sub">
            {metrics.fees.transactionsThisMonth} transactions
          </div>
        </div>

        <div className="record-card">
          <span className="record-code">FEE-02</span>
          <div className="record-label">Overdue fees</div>
          <div
            className={`record-value ${
              metrics.fees.overdueFees > 0 ? "rust" : ""
            }`}
          >
            {metrics.fees.overdueFees}
          </div>
        </div>

        <div className="record-card">
          <span className="record-code">ATT-01</span>
          <div className="record-label">Attendance today</div>
          <div className="record-value">{metrics.attendance.todayRate}%</div>
          <div className="record-sub">
            {metrics.attendance.present} present, {metrics.attendance.absent}{" "}
            absent
          </div>
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title">Upcoming exams</h2>
        {metrics.upcomingExams.length === 0 ? (
          <p className="panel-empty">
            No exams scheduled in the next seven days.
          </p>
        ) : (
          metrics.upcomingExams.map((exam) => (
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
        <h2 className="panel-title">Pinned announcements</h2>
        {metrics.announcements.length === 0 ? (
          <p className="panel-empty">No pinned announcements right now.</p>
        ) : (
          metrics.announcements.map((a) => (
            <div className="panel-row" key={a.id}>
              <span className="panel-row-title">{a.title}</span>
              <span className="panel-row-meta">
                {new Date(a.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="panel">
        <h2 className="panel-title">Recent activity</h2>
        {metrics.recentActivities.length === 0 ? (
          <p className="panel-empty">No activity logged yet.</p>
        ) : (
          metrics.recentActivities.map((log) => (
            <div className="panel-row" key={log.id}>
              <span className="panel-row-title">
                {log.action}
                {log.entity ? ` — ${log.entity}` : ""}
              </span>
              <span className="panel-row-meta">
                {new Date(log.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
