"use client";

import { Suspense } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "./actions";
import { useSearchParams } from "next/navigation";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Verifying..." : "Sign in"}
    </button>
  );
}

function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";

  return (
    <div className="auth-page">
      <div className="auth-letterhead">
        <span className="auth-seal" />
        <div>
          <div className="auth-letterhead-title">EEF College</div>
          <div className="auth-letterhead-sub">Administration &amp; Student Portal</div>
        </div>
      </div>

      <div className="auth-card">
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-subtitle">
          Use the account credentials issued by the registrar's office.
        </p>

        <form action={formAction} className="auth-form">
          <input type="hidden" name="next" value={next} />

          <label className="field-label" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className="field-input"
            placeholder="you@eefcollege.edu.pk"
          />

          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="field-input"
            placeholder="••••••••"
          />

          {state.error && <p className="field-error">{state.error}</p>}

          <SubmitButton />
        </form>

        <p className="auth-footnote">
          Accounts are created by the registrar's office. Contact your
          department if you need access.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
