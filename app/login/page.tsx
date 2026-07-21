import type { Metadata } from "next";
import Image from "next/image";
import logo from "@/public/logo.png";
import { LoginForm } from "./_components/login-form";

// Keeps this page out of search engine indexes. It is never linked from
// the public site - the only way to reach it is knowing the URL, or
// being redirected here by middleware when visiting the private admin
// path without a session.
export const metadata: Metadata = {
  title: "Sign in - EEF College",
  robots: { index: false, follow: false },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <div className="auth-page">
      <div className="auth-letterhead">
        <Image src={logo} alt="EEF College logo" className="auth-seal" width={40} height={40} priority />
        <div>
          <div className="auth-letterhead-title">EEF College</div>
          <div className="auth-letterhead-sub">Administration sign in</div>
        </div>
      </div>

      <div className="auth-card" style={{ maxWidth: 420 }}>
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-subtitle">
          Authorised personnel only. Access is logged.
        </p>

        <LoginForm next={searchParams.next ?? ""} />
      </div>
    </div>
  );
}
