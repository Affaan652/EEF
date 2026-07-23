import { logoutAction } from "@/app/login/actions";

export default function SettingsPage() {
  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Account</div>
        <h1 className="main-title">Settings</h1>
      </div>
      <hr className="ledger-rule" />

      <div className="panel" style={{ maxWidth: 560 }}>
        <h2 className="panel-title">Session</h2>
        <p className="field-hint" style={{ margin: "0 0 16px" }}>
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
