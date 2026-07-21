"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/actions/fee-admin";

type AcademicYear = { id: string; label: string };
type Department = { id: string; name: string };

type FeeStructureDefaults = {
  id?: string;
  name?: string;
  academicYearId?: string;
  departmentId?: string | null;
  dueDate?: string;
  isActive?: boolean;
  tuitionFee?: number;
  admissionFee?: number;
  examFee?: number;
  libraryFee?: number;
  sportsFee?: number;
  otherFee?: number;
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

export function FeeStructureForm({
  academicYears,
  departments,
  action,
  defaults,
  mode,
}: {
  academicYears: AcademicYear[];
  departments: Department[];
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaults?: FeeStructureDefaults;
  mode: "create" | "edit";
}) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="admin-form">
      {state.error && <p className="field-error">{state.error}</p>}

      {mode === "edit" && defaults?.id && (
        <input type="hidden" name="feeStructureId" value={defaults.id} />
      )}

      <label className="field-label" htmlFor="name">
        Structure name
      </label>
      <input
        id="name"
        name="name"
        required
        className="field-input"
        placeholder="e.g. Semester 1 — DIT"
        defaultValue={defaults?.name}
      />

      <div className="form-grid">
        <div>
          <label className="field-label" htmlFor="academicYearId">
            Academic year
          </label>
          <select
            id="academicYearId"
            name="academicYearId"
            required
            className="field-input"
            defaultValue={defaults?.academicYearId ?? ""}
          >
            <option value="">Select</option>
            {academicYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="departmentId">
            Department
          </label>
          <select
            id="departmentId"
            name="departmentId"
            className="field-input"
            defaultValue={defaults?.departmentId ?? ""}
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="field-label" htmlFor="dueDate">
        Due date
      </label>
      <input
        id="dueDate"
        name="dueDate"
        type="date"
        required
        className="field-input"
        defaultValue={defaults?.dueDate}
      />

      <p className="field-hint" style={{ marginTop: 18 }}>
        Fee components (PKR) — the total is calculated automatically.
      </p>

      <div className="form-grid">
        <div>
          <label className="field-label" htmlFor="tuitionFee">
            Tuition fee
          </label>
          <input
            id="tuitionFee"
            name="tuitionFee"
            type="number"
            min="0"
            step="1"
            className="field-input"
            defaultValue={defaults?.tuitionFee ?? 0}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="admissionFee">
            Admission fee
          </label>
          <input
            id="admissionFee"
            name="admissionFee"
            type="number"
            min="0"
            step="1"
            className="field-input"
            defaultValue={defaults?.admissionFee ?? 0}
          />
        </div>
      </div>

      <div className="form-grid">
        <div>
          <label className="field-label" htmlFor="examFee">
            Exam fee
          </label>
          <input
            id="examFee"
            name="examFee"
            type="number"
            min="0"
            step="1"
            className="field-input"
            defaultValue={defaults?.examFee ?? 0}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="libraryFee">
            Library fee
          </label>
          <input
            id="libraryFee"
            name="libraryFee"
            type="number"
            min="0"
            step="1"
            className="field-input"
            defaultValue={defaults?.libraryFee ?? 0}
          />
        </div>
      </div>

      <div className="form-grid">
        <div>
          <label className="field-label" htmlFor="sportsFee">
            Sports fee
          </label>
          <input
            id="sportsFee"
            name="sportsFee"
            type="number"
            min="0"
            step="1"
            className="field-input"
            defaultValue={defaults?.sportsFee ?? 0}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="otherFee">
            Other fee
          </label>
          <input
            id="otherFee"
            name="otherFee"
            type="number"
            min="0"
            step="1"
            className="field-input"
            defaultValue={defaults?.otherFee ?? 0}
          />
        </div>
      </div>

      <label className="field-checkbox" htmlFor="isActive">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          defaultChecked={defaults?.isActive ?? true}
        />
        Active (visible for assigning to students)
      </label>

      <div style={{ marginTop: 22 }}>
        {mode === "create" ? (
          <SubmitButton label="Create fee structure" pendingLabel="Saving..." />
        ) : (
          <SubmitButton label="Save changes" pendingLabel="Saving..." />
        )}
      </div>
    </form>
  );
}
