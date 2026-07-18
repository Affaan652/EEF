import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-mark">
          EEF <span>Portal</span>
        </div>
        <div className="sidebar-role">{session.role.replace("_", " ")}</div>

        <div className="nav-group-label">My records</div>
        <ul className="nav-list">
          <li>
            <a href="/portal" className="nav-item active">
              Overview
            </a>
          </li>
        </ul>

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
