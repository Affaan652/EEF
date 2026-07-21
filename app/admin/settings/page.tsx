import { ThemeToggle } from "@/app/admin/_components/theme-toggle";

export default function SettingsPage() {
  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Account</div>
        <h1 className="main-title">Settings</h1>
      </div>
      <hr className="ledger-rule" />

      <div className="panel" style={{ maxWidth: 560 }}>
        <h2 className="panel-title">Appearance</h2>
        <div className="theme-toggle-row">
          <p className="theme-toggle-desc">
            Choose how the console looks on this device. This is saved in
            your browser only.
          </p>
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}
