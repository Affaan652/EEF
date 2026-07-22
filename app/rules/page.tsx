import type { Metadata } from "next";
import { SiteHeader } from "@/app/_components/site-header";
import { SiteFooter } from "@/app/_components/site-footer";

export const metadata: Metadata = {
  title: "Student Rules & Regulations — EEF Polytechnic Institute of Haripur",
  description:
    "Student rules and regulations at EEF Polytechnic Institute of Haripur.",
};

const RULES = [
  "Students must maintain regular attendance as required by the institute.",
  "Respect for faculty members, staff, and fellow students is mandatory.",
  "Students are expected to maintain discipline and a professional learning environment.",
  "Cheating, misconduct, vandalism, or any inappropriate behavior will result in disciplinary action.",
  "Students must follow all academic policies, examination rules, and institute regulations.",
  "Institute property should be used responsibly and kept in good condition.",
];

export default function RulesPage() {
  return (
    <>
      <SiteHeader />

      <div className="content-page-header">
        <div className="content-page-eyebrow">Student Rules & Regulations</div>
        <h1 className="content-page-title">
          Standards every student agrees to on enrollment
        </h1>
        <p className="content-page-lede">
          These rules keep the institute a safe, disciplined, and productive
          place to learn.
        </p>
      </div>

      <div className="content-body">
        <div className="content-section">
          <ol className="rules-list">
            {RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        </div>

        <div className="content-section">
          <div className="content-callout">
            At Education Employees Foundation Polytechnic Institute of
            Haripur, we are dedicated to developing{" "}
            <strong>skilled, responsible, and career-ready professionals</strong>{" "}
            through excellence in technical education.
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
