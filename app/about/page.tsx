import type { Metadata } from "next";
import { SiteHeader } from "@/app/_components/site-header";
import { SiteFooter } from "@/app/_components/site-footer";

export const metadata: Metadata = {
  title: "About the Institute — EEF Polytechnic Institute of Haripur",
  description:
    "Education Employees Foundation (EEF) Polytechnic Institute of Haripur was established in 2009 to provide high-quality technical and vocational education.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />

      <div className="content-page-header">
        <div className="content-page-eyebrow">About the Institute</div>
        <h1 className="content-page-title">
          Education Employees Foundation (EEF) Polytechnic Institute of Haripur
        </h1>
        <p className="content-page-lede">
          Established in 2009 with the vision of providing high-quality
          technical and vocational education to the youth of Khyber
          Pakhtunkhwa.
        </p>
      </div>

      <div className="content-body">
        <div className="content-section">
          <h2 className="content-section-title">Our story</h2>
          <hr className="content-section-rule" />
          <p>
            Education Employees Foundation (EEF) Polytechnic Institute of
            Haripur was established in 2009 with the vision of providing
            high-quality technical and vocational education. Since its
            inception, the institute has been committed to preparing skilled
            professionals through quality teaching, practical training, and
            industry-focused education.
          </p>
          <p>
            Our goal is to equip students with the technical knowledge and
            professional skills required to excel in today&apos;s
            competitive job market and contribute to the nation&apos;s
            development.
          </p>
        </div>

        <div className="content-section">
          <h2 className="content-section-title">Our commitment</h2>
          <hr className="content-section-rule" />
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
