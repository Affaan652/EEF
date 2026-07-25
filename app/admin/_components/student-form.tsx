"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/actions/student-admin";

type Department = { id: string; name: string };
type ClassOption = {
  id: string;
  name: string;
  section: string | null;
  academicYear: { label: string };
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

// Plain Day/Month/Year selects instead of <input type="date">. The native
// date picker (especially in the packaged desktop app's webview) was
// getting stuck open - it wouldn't close after picking a date or clicking
// elsewhere. Selects have no popup to get stuck, so this sidesteps the
// bug entirely. A hidden input still carries the combined "YYYY-MM-DD"
// value under the same field name, so the server action needs no changes.
function DateOfBirthField({ defaultValue }: { defaultValue?: string }) {
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: 70 }, (_, i) => currentYear - 10 - i),
    [currentYear]
  );

  const initial = defaultValue ? defaultValue.split("-").map(Number) : null;
  const [year, setYear] = useState<number | "">(initial ? initial[0] : "");
  const [month, setMonth] = useState<number | "">(initial ? initial[1] : "");
  const [day, setDay] = useState<number | "">(initial ? initial[2] : "");

  const maxDay = year && month ? daysInMonth(month, year) : 31;
  const dayOptions = Array.from({ length: maxDay }, (_, i) => i + 1);

  const combined =
    year && month && day
      ? `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
          2,
          "0"
        )}`
      : "";

  return (
    <div className="dob-field">
      <input type="hidden" name="dateOfBirth" value={combined} />
      <select
        aria-label="Day"
        className="field-input"
        value={day}
        onChange={(e) => setDay(e.target.value ? Number(e.target.value) : "")}
      >
        <option value="">Day</option>
        {dayOptions.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <select
        aria-label="Month"
        className="field-input"
        value={month}
        onChange={(e) => {
          const next = e.target.value ? Number(e.target.value) : "";
          setMonth(next);
          if (next && day && day > daysInMonth(next, year || currentYear)) {
            setDay(daysInMonth(next, year || currentYear));
          }
        }}
      >
        <option value="">Month</option>
        {MONTHS.map((m, i) => (
          <option key={m} value={i + 1}>
            {m}
          </option>
        ))}
      </select>
      <select
        aria-label="Year"
        className="field-input"
        value={year}
        onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")}
      >
        <option value="">Year</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}

type StudentDefaults = {
  id?: string;
  firstName?: string;
  lastName?: string;
  rollNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  email?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  departmentId?: string | null;
  classId?: string | null;
};

function classLabel(c: ClassOption) {
  const section = c.section ? ` - ${c.section}` : "";
  return `${c.name}${section} (${c.academicYear.label})`;
}

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

const initialState: ActionState = {};

export function StudentForm({
  departments,
  classes,
  action,
  defaults,
  mode,
}: {
  departments: Department[];
  classes: ClassOption[];
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaults?: StudentDefaults;
  mode: "create" | "edit";
}) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="admin-form">
      {state.error && <p className="field-error">{state.error}</p>}

      {mode === "edit" && defaults?.id && (
        <input type="hidden" name="studentId" value={defaults.id} />
      )}

      <h2 className="panel-title" style={{ fontSize: 16, marginTop: 0 }}>
        Personal information
      </h2>
      <div className="form-grid">
        <div>
          <label className="field-label" htmlFor="firstName">
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            required
            className="field-input"
            defaultValue={defaults?.firstName}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="lastName">
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            required
            className="field-input"
            defaultValue={defaults?.lastName}
          />
        </div>
      </div>

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
            defaultValue={defaults?.rollNumber}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="gender">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            className="field-input"
            defaultValue={defaults?.gender ?? "MALE"}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      <label className="field-label">Date of birth</label>
      <DateOfBirthField defaultValue={defaults?.dateOfBirth} />

      <label className="field-label" htmlFor="departmentId">
        Department / Program
      </label>
      <select
        id="departmentId"
        name="departmentId"
        className="field-input"
        defaultValue={defaults?.departmentId ?? ""}
      >
        <option value="">Unassigned</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      <label className="field-label" htmlFor="classId">
        Class
      </label>
      <select
        id="classId"
        name="classId"
        className="field-input"
        defaultValue={defaults?.classId ?? ""}
      >
        <option value="">Not assigned to a class</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {classLabel(c)}
          </option>
        ))}
      </select>

      <h2 className="panel-title" style={{ fontSize: 16, marginTop: 22 }}>
        Contact
      </h2>
      <div className="form-grid">
        <div>
          <label className="field-label" htmlFor="phone">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            className="field-input"
            defaultValue={defaults?.phone ?? ""}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="whatsappNumber">
            WhatsApp number
          </label>
          <input
            id="whatsappNumber"
            name="whatsappNumber"
            className="field-input"
            placeholder="03xx-xxxxxxx"
            defaultValue={defaults?.whatsappNumber ?? ""}
          />
        </div>
      </div>

      <h2 className="panel-title" style={{ fontSize: 16, marginTop: 22 }}>
        Guardian
      </h2>
      <div className="form-grid">
        <div>
          <label className="field-label" htmlFor="guardianName">
            Guardian name
          </label>
          <input
            id="guardianName"
            name="guardianName"
            className="field-input"
            defaultValue={defaults?.guardianName ?? ""}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="guardianPhone">
            Guardian phone
          </label>
          <input
            id="guardianPhone"
            name="guardianPhone"
            className="field-input"
            defaultValue={defaults?.guardianPhone ?? ""}
          />
        </div>
      </div>

      <p className="field-hint">
        This adds a student record for internal use (classes, attendance,
        exams, fees). It does not create a login of any kind.
      </p>

      <div style={{ marginTop: 8 }}>
        {mode === "create" ? (
          <SubmitButton label="Add student" pendingLabel="Saving..." />
        ) : (
          <SubmitButton label="Save changes" pendingLabel="Saving..." />
        )}
      </div>
    </form>
  );
}
