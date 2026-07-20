import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <div className="site-brand">
            <span className="site-brand-seal">EEF</span>
            EEF College
          </div>
          <nav className="site-nav">
            <a href="#services">Programs</a>
          </nav>
        </div>
      </header>

      <section className="landing-hero">
        <div>
          <div className="landing-eyebrow">Technical & Vocational Institute</div>
          <h1 className="landing-title">
            Three-year diploma programs in engineering and technology.
          </h1>
          <p className="landing-lede">
            EEF College offers 3-year diploma programs in Information
            Technology, Civil, Mechanical, and Electrical disciplines. This
            site is where the college runs admissions, fees, attendance,
            and academic records.
          </p>
          <div className="landing-actions">
            <Link href="/apply" className="btn-primary">
              Apply for admission
            </Link>
          </div>
        </div>

        <div className="landing-panel" id="services">
          <div className="landing-panel-title">Diploma programs (3 years)</div>
          <div className="landing-service">
            <div>
              <div className="landing-service-name">
                Diploma in Information Technology (DIT)
              </div>
              <div className="landing-service-desc">
                Software, networking, and systems fundamentals
              </div>
            </div>
          </div>
          <div className="landing-service">
            <div>
              <div className="landing-service-name">Civil Engineering</div>
              <div className="landing-service-desc">
                Construction, surveying, structural design
              </div>
            </div>
          </div>
          <div className="landing-service">
            <div>
              <div className="landing-service-name">Mechanical Engineering</div>
              <div className="landing-service-desc">
                Manufacturing, machine design, thermodynamics
              </div>
            </div>
          </div>
          <div className="landing-service">
            <div>
              <div className="landing-service-name">Electrical Engineering</div>
              <div className="landing-service-desc">
                Power systems, wiring, industrial electronics
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer" id="about">
        EEF College - a technical institute offering 3-year diplomas in DIT,
        Civil, Mechanical, and Electrical Engineering. Sign-in access is
        restricted to authorized administrators.
      </footer>
    </>
  );
}
