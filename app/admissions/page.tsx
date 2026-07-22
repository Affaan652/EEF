import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/app/_components/site-header";
import { SiteFooter } from "@/app/_components/site-footer";

export const metadata: Metadata = {
  title: "Admissions — EEF Polytechnic Institute of Haripur",
  description:
    "Admission eligibility and required documents for EEF Polytechnic Institute of Haripur.",
};

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M5 12.5l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ELIGIBILITY = [
  "Have passed SSC (Matric) with Science.",
  "Obtain a minimum of 40% marks in the SSC examination.",
];

const DOCUMENTS = [
  "Four photocopies of the SSC (Matric) Detailed Marks Certificate (DMC)",
  "Student's B-Form",
  "Father's CNIC",
  "Six (6) recent passport-size photographs",
];

export default function AdmissionsPage() {
  return (
    <>
      <SiteHeader />

      <div className="content-page-header">
        <div className="content-page-eyebrow">Admissions</div>
        <h1 className="content-page-title">Admission eligibility & required documents</h1>
        <p className="content-page-lede">
          Review the criteria below before you start your application.
        </p>
      </div>

      <div className="content-body">
        <div className="admissions-grid">
          <div className="content-section">
            <h2 className="content-section-title">Eligibility</h2>
            <hr className="content-section-rule" />
            <ul className="content-list">
              {ELIGIBILITY.map((item) => (
                <li key={item}>
                  <span className="bullet-mark">
                    <Check />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="content-section">
            <h2 className="content-section-title">Required documents</h2>
            <hr className="content-section-rule" />
            <ul className="content-list">
              {DOCUMENTS.map((item) => (
                <li key={item}>
                  <span className="bullet-mark">
                    <Check />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="content-cta">
          <Link href="/apply" className="btn-primary">
            Start your application
          </Link>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
