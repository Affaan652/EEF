"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "@/public/logo.png";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/admissions", label: "Admissions" },
  { href: "/rules", label: "Rules" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand" onClick={() => setOpen(false)}>
          <Image
            src={logo}
            alt="EEF Polytechnic Institute Haripur logo"
            className="site-brand-logo"
            width={40}
            height={40}
            priority
          />
          <span className="site-brand-text">
            EEF Polytechnic
            <span className="site-brand-sub">Institute of Haripur</span>
          </span>
        </Link>

        <button
          type="button"
          className="site-nav-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>

        <nav className={`site-nav ${open ? "open" : ""}`}>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/apply" className="btn-primary" onClick={() => setOpen(false)}>
            Apply now
          </Link>
        </nav>
      </div>
    </header>
  );
}
