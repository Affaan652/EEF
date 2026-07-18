import Link from "next/link";
import { getSession } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();
  const signedInHref = session
    ? isAdminRole(session.role)
      ? "/admin"
      : "/portal"
    : "/login";
  const signedInLabel = session ? "Go to my dashboard" : "Sign in";

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <div className="site-brand">
            <span className="site-brand-seal">EEF</span>
            EEF College
          </div>
          <nav className="site-nav">
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <Link href={signedInHref} className="btn-primary">
              {signedInLabel}
            </Link>
          </nav>
        </div>
      </header>

      <section className="landing-hero">
        <div>
          <div className="landing-eyebrow">Official Administration Portal</div>
          <h1 className="landing-title">
            Admissions, fees, attendance, and academic records, managed in one
            place.
          </h1>
          <p className="landing-lede">
            EEF College runs its student information system through this
            portal. Staff manage records here; students and staff sign in to
            view their own attendance, fees, and results.
          </p>
          <div className="landing-actions">
            <Link href="/login" className="btn-primary">
              Sign in to your account
            </Link>
            <span className="landing-note">
              Accounts are issued by the registrar's office
            </span>
          </div>
        </div>

        <div className="landing-panel" id="services">
          <div className="landing-panel-title">Departments served</div>
          <div className="landing-service">
            <div>
              <div className="landing-service-name">Admissions</div>
              <div className="landing-service-desc">
                Applications, review, enrollment
              </div>
            </div>
          </div>
          <div className="landing-service">
            <div>
              <div className="landing-service-name">Accounts</div>
              <div className="landing-service-desc">
                Fee structures, payments, dues
              </div>
            </div>
          </div>
          <div className="landing-service">
            <div>
              <div className="landing-service-name">Academics</div>
              <div className="landing-service-desc">
                Classes, exams, results, timetables
              </div>
            </div>
          </div>
          <div className="landing-service">
            <div>
              <div className="landing-service-name">Attendance</div>
              <div className="landing-service-desc">
                Daily records by class
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer" id="about">
        EEF College - Administration &amp; Student Portal. Access is
        restricted to enrolled students, staff, and authorized administrators.
      </footer>
    </>
  );
}
