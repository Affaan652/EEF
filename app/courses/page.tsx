import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/app/_components/site-header";
import { SiteFooter } from "@/app/_components/site-footer";

export const metadata: Metadata = {
  title: "Courses Offered — EEF Polytechnic Institute of Haripur",
  description:
    "DAE Civil, Electrical, and Mechanical Technology, plus 1-year and 2-year Diploma in Information Technology (DIT) programs.",
};

const COURSES = [
  {
    badge: "DAE · 3 Years",
    title: "DAE Civil Technology",
    desc: "Construction, surveying, structural design, and site supervision.",
  },
  {
    badge: "DAE · 3 Years",
    title: "DAE Electrical Technology",
    desc: "Power systems, wiring, industrial electronics, and maintenance.",
  },
  {
    badge: "DAE · 3 Years",
    title: "DAE Mechanical Technology",
    desc: "Manufacturing, machine design, and thermodynamics fundamentals.",
  },
  {
    badge: "DIT · 1 Year",
    title: "Diploma in Information Technology",
    desc: "A condensed, one-year track covering core IT and software skills.",
  },
  {
    badge: "DIT · 2 Years",
    title: "Diploma in Information Technology",
    desc: "The full two-year track: software, networking, and systems fundamentals.",
  },
];

export default function CoursesPage() {
  return (
    <>
      <SiteHeader />

      <div className="content-page-header">
        <div className="content-page-eyebrow">Courses Offered</div>
        <h1 className="content-page-title">
          Diploma and DAE programs built for the job market
        </h1>
        <p className="content-page-lede">
          Every program pairs classroom instruction with hands-on, workshop
          and lab-based training.
        </p>
      </div>

      <div className="content-body">
        <div className="content-section">
          <div className="course-grid">
            {COURSES.map((c) => (
              <div className="course-card" key={c.title}>
                <span className="course-card-badge">{c.badge}</span>
                <h3 className="course-card-title">{c.title}</h3>
                <p className="course-card-desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="content-cta">
          <Link href="/admissions" className="btn-primary">
            Check admission eligibility
          </Link>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
