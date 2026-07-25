"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/actions/student-admin";
import { classCategory } from "@/lib/class-label";

type Department = { id: string; name: string };
type ClassOption = {
  id: string;
  name: string;
  section: string | null;
  academicYear: { label: string };
};

const YEAR_OPTIONS = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
];

// Builds departmentId -> year -> classId, so picking a Department + Year
// in the form resolves to the one matching class behind the scenes. The
// two are matched by category (Civil/Electrical/Mechanical/DIT) extracted
// from their names, since classes don't carry a real department field.
function buildClassLookup(departments: Department[], classes: ClassOption[]) {
  const classesByCategory = new Map<string, Map<string, string>>();
  for (const c of classes) {
    const category = classCategory(c.name);
    const yearMatch = c.name.match(/Year\s+(\d+)/i);
    if (!category || !yearMatch) continue;
    if (!classesByCategory.has(category)) {
      classesByCategory.set(category, new Map());
    }
    classesByCategory.get(category)!.set(yearMatch[1], c.id);
  }

  const lookup = new Map<string, Map<string, string>>();
  for (const d of departments) {
    const category = classCategory(d.name);
    if (category && classesByCategory.has(category)) {
      lookup.set(d.id, classesByCategory.get(category)!);
    }
  }
  return lookup;
}

// A department may only run some of the 3 years (DIT only runs 2), so the
// Year dropdown only offers years that actually have a class to assign.
function availableYears(
  lookup: Map<string, Map<string, string>>,
  departmentId: string
) {
  const years = lookup.get(departmentId);
  if (!years) return YEAR_OPTIONS;
  return YEAR_OPTIONS.filter((y) => years.has(y.value));
}

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
  yearStart?: number | null;
  yearEnd?: number | null;
};

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
  cancelHref,
}: {
  departments: Department[];
  classes: ClassOption[];
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaults?: StudentDefaults;
  mode: "create" | "edit";
  cancelHref: string;
}) {
  const [state, formAction] = useFormState(action, initialState);

  const lookup = useMemo(
    () => buildClassLookup(departments, classes),
    [departments, classes]
  );

  const [departmentId, setDepartmentId] = useState(defaults?.departmentId ?? "");
  const [year, setYear] = useState(() => {
    if (!defaults?.departmentId || !defaults?.classId) return "";
    const years = lookup.get(defaults.departmentId);
    if (!years) return "";
    for (const [y, id] of years) {
      if (id === defaults.classId) return y;
    }
    return "";
  });

  const resolvedClassId = lookup.get(departmentId)?.get(year) ?? "";
  const yearOptions = availableYears(lookup, departmentId);

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
        value={departmentId}
        onChange={(e) => {
          setDepartmentId(e.target.value);
          setYear("");
        }}
      >
        <option value="">Unassigned</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      <label className="field-label" htmlFor="year">
        Year
      </label>
      <select
        id="year"
        className="field-input"
        value={year}
        disabled={!departmentId}
        onChange={(e) => setYear(e.target.value)}
      >
        <option value="">
          {departmentId ? "Select year" : "Choose a department first"}
        </option>
        {yearOptions.map((y) => (
          <option key={y.value} value={y.value}>
            {y.label}
          </option>
        ))}
      </select>
      <input type="hidden" name="classId" value={resolvedClassId} />

      <div className="form-grid">
        <div>
          <label className="field-label" htmlFor="yearStart">
            Year start
          </label>
          <input
            id="yearStart"
            name="yearStart"
            type="number"
            inputMode="numeric"
            placeholder="e.g. 2024"
            className="field-input"
            defaultValue={defaults?.yearStart ?? ""}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="yearEnd">
            Year end
          </label>
          <input
            id="yearEnd"
            name="yearEnd"
            type="number"
            inputMode="numeric"
            placeholder="e.g. 2027"
            className="field-input"
            defaultValue={defaults?.yearEnd ?? ""}
          />
        </div>
      </div>
      <p className="field-hint" style={{ marginTop: -6, marginBottom: 18 }}>
        The calendar years this student is enrolled across (e.g. 2024 to
        2027). This is what the Year filter on the students list searches
        by.
      </p>

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

      <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
        {mode === "create" ? (
          <SubmitButton label="Add student" pendingLabel="Saving..." />
        ) : (
          <SubmitButton label="Save changes" pendingLabel="Saving..." />
        )}
        <Link href={cancelHref} className="btn-ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
}
