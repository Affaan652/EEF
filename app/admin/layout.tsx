import { redirect } from "next/navigation";
import { getSession, isAdminRole, getAdminRoute } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";

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

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense in depth: middleware already blocks this route, but a Server
  // Component that reads sensitive data should never rely on middleware
  // alone, since middleware can be bypassed by misconfiguration.
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    redirect("/login");
  }

  const adminRoute = `/${getAdminRoute()}`;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-mark">
          EEF <span>Admin</span>
        </div>
        <div className="sidebar-role">{session.role.replace("_", " ")}</div>

        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="nav-group-label">{group.label}</div>
            <ul className="nav-list">
              {group.items.map((item) =>
                item.active ? (
                  <li key={item.name}>
                    <a href={adminRoute} className="nav-item active">
                      {item.name}
                    </a>
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

        <div className="sidebar-footer">
          <div className="sidebar-user">{session.email}</div>
          <form action={logoutAction} className="logout-form">
            <button type="submit">Sign out</button>
          </form>
        </div>
      </aside>

      <div className="main">{children}</div>
    </div>
  );
}
