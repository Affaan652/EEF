import Link from "next/link";

export default function Home() {
  return (
    <main className="landing">
      <div className="landing-mark">
        <span className="landing-mark-seal" />
        EEF College, Registrar's Office
      </div>

      <div className="landing-hero">
        <div className="landing-eyebrow">Administration Console</div>
        <h1 className="landing-title">
          Every student, fee, and
          <br />
          <em>class period</em>, in one ledger.
        </h1>
        <p className="landing-lede">
          A single record for admissions, attendance, fee collection, and
          academics across the college, kept current as the day unfolds.
        </p>
        <div className="landing-actions">
          <Link href="/dashboard" className="btn-primary">
            Open the dashboard
          </Link>
          <span className="landing-footnote">Live data, updated on load</span>
        </div>
      </div>

      <div className="landing-registry">
        <div className="registry-item">
          <strong>Admissions</strong>
          Application intake through enrollment
        </div>
        <div className="registry-item">
          <strong>Fees</strong>
          Structures, payments, and dues
        </div>
        <div className="registry-item">
          <strong>Attendance</strong>
          Daily records by class
        </div>
        <div className="registry-item">
          <strong>Academics</strong>
          Exams, marks, and timetables
        </div>
      </div>
    </main>
  );
}
