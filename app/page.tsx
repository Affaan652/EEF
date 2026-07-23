import Image from "next/image";
import Link from "next/link";
import campusHero from "@/public/campus-hero.jpg";
import { SiteHeader } from "@/app/_components/site-header";
import { SiteFooter } from "@/app/_components/site-footer";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <section className="landing-hero-wrap">
        <div className="landing-hero">
          <div className="landing-hero-copy">
            <h1 className="landing-title">
              Technical education that leads to real careers.
            </h1>
            <p className="landing-lede">
              A Government of Khyber Pakhtunkhwa institute. EEF Polytechnic
              prepares skilled professionals through quality teaching,
              practical training, and industry-focused education in Civil,
              Electrical, Mechanical, and Information Technology.
            </p>
            <div className="landing-actions">
              <Link href="/apply" className="btn-primary">
                Apply for admission
              </Link>
              <Link href="/courses" className="btn-ghost">
                View courses
              </Link>
            </div>
            <p className="landing-note">
              Applications for the current intake are open.
            </p>
          </div>

          <div className="landing-hero-image">
            <Image
              src={campusHero}
              alt="EEF Polytechnic Institute of Haripur campus building"
              priority
              sizes="(max-width: 860px) 100vw, 480px"
            />
          </div>
        </div>

        <svg
          className="landing-hero-wave"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,32 C240,60 480,4 720,20 C960,36 1200,54 1440,24 L1440,60 L0,60 Z"
            fill="var(--bg-subtle)"
          />
        </svg>
      </section>

      <div className="stats-strip">
        <div className="stats-strip-inner">
          <div>
            <div className="stats-strip-value">2009</div>
            <div className="stats-strip-label">Institute established</div>
          </div>
          <div>
            <div className="stats-strip-value">5</div>
            <div className="stats-strip-label">Diploma & DAE programs</div>
          </div>
          <div>
            <div className="stats-strip-value">3 Yrs</div>
            <div className="stats-strip-label">Core DAE technologies</div>
          </div>
          <div>
            <div className="stats-strip-value">40%</div>
            <div className="stats-strip-label">Minimum SSC eligibility</div>
          </div>
        </div>
      </div>

      <section className="landing-panel-section" id="services">
        <div className="section-heading">
          <div className="section-heading-eyebrow">What we teach</div>
          <h2 className="section-heading-title">Programs offered</h2>
        </div>
        <div className="course-grid">
          <div className="course-card">
            <span className="course-card-index">01</span>
            <span className="course-card-badge">DAE · 3 Years</span>
            <h3 className="course-card-title">DAE Civil Technology</h3>
            <p className="course-card-desc">
              Construction, surveying, and structural design.
            </p>
          </div>
          <div className="course-card">
            <span className="course-card-index">02</span>
            <span className="course-card-badge">DAE · 3 Years</span>
            <h3 className="course-card-title">DAE Electrical Technology</h3>
            <p className="course-card-desc">
              Power systems, wiring, and industrial electronics.
            </p>
          </div>
          <div className="course-card">
            <span className="course-card-index">03</span>
            <span className="course-card-badge">DAE · 3 Years</span>
            <h3 className="course-card-title">DAE Mechanical Technology</h3>
            <p className="course-card-desc">
              Manufacturing, machine design, and thermodynamics.
            </p>
          </div>
          <div className="course-card">
            <span className="course-card-index">04</span>
            <span className="course-card-badge">DIT · 1 & 2 Years</span>
            <h3 className="course-card-title">
              Diploma in Information Technology
            </h3>
            <p className="course-card-desc">
              Software, networking, and systems fundamentals.
            </p>
          </div>
        </div>
      </section>

      <section className="content-cta" style={{ paddingBottom: 56 }}>
        <Link href="/about" className="btn-ghost" style={{ marginRight: 12 }}>
          About the institute
        </Link>
        <Link href="/admissions" className="btn-ghost">
          Admission requirements
        </Link>
      </section>

      <SiteFooter />
    </>
  );
}
