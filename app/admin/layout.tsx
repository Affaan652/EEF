import { redirect } from "next/navigation";
import { getSession, isAdminRole, getAdminRoute } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";
import AdminSidebar from "./_components/admin-sidebar";

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
    redirect(`/${getAdminRoute()}`);
  }

  const base = `/${getAdminRoute()}`;

  const navGroups = [
    {
      label: "Overview",
      items: [{ name: "Dashboard", href: base }],
    },
    {
      label: "Records",
      items: [
        { name: "Students", href: `${base}/students` },
        { name: "Admissions", href: `${base}/admissions` },
      ],
    },
    {
      label: "Finance",
      items: [{ name: "Fees", href: `${base}/fees` }],
    },
    {
      label: "Academics",
      items: [
        { name: "Classes", href: `${base}/classes` },
        { name: "Exams", href: `${base}/exams` },
        { name: "Attendance", href: `${base}/attendance` },
      ],
    },
    {
      label: "Account",
      items: [{ name: "Settings", href: `${base}/settings` }],
    },
  ];

  return (
    <div className="shell">
      <AdminSidebar
        navGroups={navGroups}
        roleLabel={session.role.replace("_", " ")}
        email={session.email}
        logoutAction={logoutAction}
      />
      <div className="main">{children}</div>
    </div>
  );
}
