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
          {open ? "\u2715" : "\u2630"}
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
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="sidebar-footer">
          <div className="sidebar-user">{email}</div>
          <form action={logoutAction} className="logout-form">
            <button type="submit">Sign out</button>
          </form>
        </div>
      </div>
    </aside>
  );
}
