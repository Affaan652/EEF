import { logoutAction } from "@/app/login/actions";
import { getSession } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await getSession();

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Account</div>
        <h1 className="main-title">Settings</h1>
      </div>
      <hr className="ledger-rule" />

      <div className="panel" style={{ maxWidth: 560 }}>
        <h2 className="panel-title">Session</h2>
        <div className="panel-row">
          <span className="panel-row-title">Signed in as</span>
          <span className="panel-row-meta">{session?.email}</span>
        </div>
        <p className="field-hint" style={{ margin: "16px 0" }}>
          Sign out of the admin console on this device.
        </p>
        <form action={logoutAction}>
          <button type="submit" className="btn-ghost">
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}
