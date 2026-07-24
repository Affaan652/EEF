import { redirect } from "next/navigation";
import { getSession, isAdminRole, getAdminRoute } from "@/lib/auth";
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
    <>
      <script
        // Runs before React hydrates so the sidebar doesn't visibly
        // expand-then-collapse (or vice versa) on load. Only ever reads
        // a plain localStorage flag - no theming, no tracking.
        dangerouslySetInnerHTML={{
          __html: `try{var c=localStorage.getItem("eef-admin-sidebar-collapsed");document.body.setAttribute("data-sidebar-collapsed",c==="true"?"true":"false");}catch(e){}`,
        }}
      />
      <div className="shell">
        <AdminSidebar navGroups={navGroups} />
        <div className="main">{children}</div>
      </div>
    </>
  );
}
