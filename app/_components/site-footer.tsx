import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-col">
          <div className="site-footer-title">EEF Polytechnic Institute</div>
          <p className="site-footer-text">
            Education Employees Foundation (EEF) Polytechnic Institute of
            Haripur — established 2009. A Government of Khyber Pakhtunkhwa
            technical and vocational institute.
          </p>
        </div>
        <div className="site-footer-col">
          <div className="site-footer-title">Explore</div>
          <Link href="/about">About the institute</Link>
          <Link href="/courses">Courses offered</Link>
          <Link href="/admissions">Admissions</Link>
          <Link href="/fees">Fee structure</Link>
          <Link href="/rules">Student rules</Link>
        </div>
        <div className="site-footer-col">
          <div className="site-footer-title">Get started</div>
          <Link href="/apply">Apply for admission</Link>
        </div>
      </div>
      <div className="site-footer-bottom">
        © {new Date().getFullYear()} Education Employees Foundation Polytechnic Institute, Haripur. All rights reserved.
      </div>
    </footer>
  );
}
