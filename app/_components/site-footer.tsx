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
          <Link href="/rules">Student rules</Link>
        </div>
        <div className="site-footer-col">
          <div className="site-footer-title">Get started</div>
          <Link href="/apply">Apply for admission</Link>
          <Link href="/login">Administration sign in</Link>
        </div>
      </div>
      <div className="site-footer-bottom">
        Education Employees Foundation Polytechnic Institute, Haripur.
        Sign-in access is restricted to authorized administrators.
      </div>
    </footer>
  );
}
