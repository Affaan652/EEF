"use client";

import { useFormState, useFormStatus } from "react-dom";
import { changeOwnPasswordAction, type ActionState } from "@/lib/actions/settings";

const initialState: ActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Saving..." : "Update password"}
    </button>
  );
}

export default function SettingsPage() {
  const [state, formAction] = useFormState(changeOwnPasswordAction, initialState);

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Account</div>
        <h1 className="main-title">Settings</h1>
      </div>
      <hr className="ledger-rule" />

      <div className="panel" style={{ maxWidth: 480 }}>
        <h2 className="panel-title">Change password</h2>

        <form action={formAction} className="admin-form">
          {state.error && <p className="field-error">{state.error}</p>}
          {state.success && <p className="field-success">{state.success}</p>}

          <label className="field-label" htmlFor="currentPassword">
            Current password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            className="field-input"
            autoComplete="current-password"
          />

          <label className="field-label" htmlFor="newPassword">
            New password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            minLength={10}
            className="field-input"
            autoComplete="new-password"
          />

          <label className="field-label" htmlFor="confirmPassword">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={10}
            className="field-input"
            autoComplete="new-password"
          />

          <SubmitButton />
        </form>
      </div>
    </>
  );
}
