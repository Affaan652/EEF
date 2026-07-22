import Image from "next/image";
import Link from "next/link";
import campusHero from "@/public/campus-hero.jpg";
import { SiteHeader } from "@/app/_components/site-header";
import { SiteFooter } from "@/app/_components/site-footer";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <section className="landing-hero">
        <div>
          <div className="landing-eyebrow">
            Government of Khyber Pakhtunkhwa · Est. 2009
          </div>
          <h1 className="landing-title">
            Technical education that leads to real careers.
          </h1>
          <p className="landing-lede">
            Education Employees Foundation (EEF) Polytechnic Institute of
            Haripur prepares skilled professionals through quality teaching,
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
        <div className="landing-panel">
          <div className="landing-panel-title">Programs offered</div>
          <div className="landing-service">
            <div>
              <div className="landing-service-name">DAE Civil Technology</div>
              <div className="landing-service-desc">
                Construction, surveying, structural design
              </div>
            </div>
          </div>
          <div className="landing-service">
            <div>
              <div className="landing-service-name">DAE Electrical Technology</div>
              <div className="landing-service-desc">
                Power systems, wiring, industrial electronics
              </div>
            </div>
          </div>
          <div className="landing-service">
            <div>
              <div className="landing-service-name">DAE Mechanical Technology</div>
              <div className="landing-service-desc">
                Manufacturing, machine design, thermodynamics
              </div>
            </div>
          </div>
          <div className="landing-service">
            <div>
              <div className="landing-service-name">
                Diploma in Information Technology (1 & 2 Year)
              </div>
              <div className="landing-service-desc">
                Software, networking, and systems fundamentals
              </div>
            </div>
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
