"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/actions/student-admin";

type Department = { id: string; name: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Saving..." : "Add student"}
    </button>
  );
}

const initialState: ActionState = {};

export function StudentCreateForm({
  departments,
  action,
}: {
  departments: Department[];
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="admin-form">
      {state.error && <p className="field-error">{state.error}</p>}

      <div className="form-grid">
        <div>
          <label className="field-label" htmlFor="firstName">
            First name
          </label>
          <input id="firstName" name="firstName" required className="field-input" />
        </div>
        <div>
          <label className="field-label" htmlFor="lastName">
            Last name
          </label>
          <input id="lastName" name="lastName" required className="field-input" />
        </div>
      </div>

      <label className="field-label" htmlFor="email">
        Email address (optional)
      </label>
      <input
        id="email"
        name="email"
        type="email"
        className="field-input"
        placeholder="name@example.com"
      />

      <div className="form-grid">
        <div>
          <label className="field-label" htmlFor="rollNumber">
            Roll number
          </label>
          <input
            id="rollNumber"
            name="rollNumber"
            required
            className="field-input"
            placeholder="DIT-2026-001"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="dateOfBirth">
            Date of birth
          </label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            required
            className="field-input"
          />
        </div>
      </div>

      <div className="form-grid">
        <div>
          <label className="field-label" htmlFor="departmentId">
            Department / Program
          </label>
          <select id="departmentId" name="departmentId" className="field-input">
            <option value="">Unassigned</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="gender">
            Gender
          </label>
          <select id="gender" name="gender" className="field-input">
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      <p className="field-hint">
        This adds a student record for internal use (classes, attendance,
        exams, fees). It does not create a login of any kind.
      </p>

      <SubmitButton />
    </form>
  );
}
