"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

type NavItem = {
  name: string;
  href: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

// Small, self-contained line icons (no external icon library, no emoji).
// Keyed by nav item name since the label set is fixed and known.
const ICONS: Record<string, JSX.Element> = {
  Dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.3" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.3" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.3" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.3" />
    </svg>
  ),
  Students: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.4" />
      <path d="M4.5 20c1.2-3.8 4.2-5.8 7.5-5.8s6.3 2 7.5 5.8" strokeLinecap="round" />
    </svg>
  ),
  Admissions: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 4h8l3 3v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      <path d="M9 12.5l2 2 4-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Fees: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5v9M14.5 9.7c-.5-.7-1.4-1.1-2.5-1.1-1.4 0-2.5.8-2.5 1.9 0 2.7 5 1.4 5 4 0 1.1-1.1 1.9-2.5 1.9-1.1 0-2-.4-2.5-1.1" strokeLinecap="round" />
    </svg>
  ),
  Classes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 4 3 8.5 12 13l9-4.5L12 4Z" strokeLinejoin="round" />
      <path d="M6.5 10.8V16c0 1.4 2.5 2.6 5.5 2.6s5.5-1.2 5.5-2.6v-5.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Exams: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6.5 3.5h8l3 3V19a1.2 1.2 0 0 1-1.2 1.2H6.5A1.2 1.2 0 0 1 5.3 19V4.7a1.2 1.2 0 0 1 1.2-1.2Z" strokeLinejoin="round" />
      <path d="M8.5 9.5h7M8.5 13h7M8.5 16.5h4.5" strokeLinecap="round" />
    </svg>
  ),
  Attendance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.8" y="4.6" width="16.4" height="15" rx="1.6" />
      <path d="M3.8 9.4h16.4M8 3v3M16 3v3" strokeLinecap="round" />
      <path d="M9 14.2l1.9 1.9 4-4.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3.1" />
      <path
        d="M12 3.6v2.1M12 18.3v2.1M20.4 12h-2.1M5.7 12H3.6M17.6 6.4l-1.5 1.5M7.9 16.1l-1.5 1.5M17.6 17.6l-1.5-1.5M7.9 7.9 6.4 6.4"
        strokeLinecap="round"
      />
    </svg>
  ),
};

export default function AdminSidebar({
  navGroups,
  roleLabel,
  email,
  logoutAction,
}: {
  navGroups: NavGroup[];
  roleLabel: string;
  email: string;
  logoutAction: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const initial = email.trim().charAt(0).toUpperCase() || "?";

  return (
    <aside className="sidebar">
      <div className="sidebar-top-row">
        <div>
          <div className="sidebar-mark">
            EEF <span>Admin</span>
          </div>
          <div className="sidebar-role">{roleLabel}</div>
        </div>
        <button
          type="button"
          className="sidebar-toggle"
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
      </div>

      <div className={`sidebar-collapsible ${open ? "open" : ""}`}>
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="nav-group-label">{group.label}</div>
            <ul className="nav-list">
              {group.items.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`nav-item ${
                      pathname === item.href ? "active" : ""
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    <span className="nav-item-icon" aria-hidden="true">
                      {ICONS[item.name]}
                    </span>
                    <span className="nav-item-text">{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-user-avatar" aria-hidden="true">
              {initial}
            </span>
            <span className="sidebar-user-email">{email}</span>
          </div>
          <form action={logoutAction} className="logout-form">
            <button type="submit">Sign out</button>
          </form>
        </div>
      </div>
    </aside>
  );
}
