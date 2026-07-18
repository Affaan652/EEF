import Link from "next/link";

const navGroups = [
  {
    label: "Overview",
    items: [{ name: "Dashboard", active: true }],
  },
  {
    label: "Records",
    items: [
      { name: "Students", active: false },
      { name: "Staff", active: false },
      { name: "Admissions", active: false },
    ],
  },
  {
    label: "Finance",
    items: [
      { name: "Fees", active: false },
      { name: "Payroll", active: false },
    ],
  },
  {
    label: "Academics",
    items: [
      { name: "Classes", active: false },
      { name: "Exams", active: false },
      { name: "Attendance", active: false },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-mark">
          EEF <span>College</span>
        </div>

        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="nav-group-label">{group.label}</div>
            <ul className="nav-list">
              {group.items.map((item) =>
                item.active ? (
                  <li key={item.name}>
                    <Link href="/dashboard" className="nav-item active">
                      {item.name}
                    </Link>
                  </li>
                ) : (
                  <li key={item.name} className="nav-item disabled">
                    {item.name}
                    <span className="nav-tag">Soon</span>
                  </li>
                )
              )}
            </ul>
          </div>
        ))}
      </aside>

      <div className="main">{children}</div>
    </div>
  );
}
