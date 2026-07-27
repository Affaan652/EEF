"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/actions/fee-admin";

type Department = { id: string; name: string };

type FeeStructureDefaults = {
  id?: string;
  name?: string;
  departmentId?: string | null;
  programYear?: number | null;
  dueDate?: string;
  isActive?: boolean;
  admissionFee?: number;
  tuitionFee?: number;
  boardRegistrationFee?: number;
  collegeCardFee?: number;
  migrationFee?: number;
  sportsFee?: number;
  studyTourFee?: number;
  miscellaneousFee?: number;
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
  departments,
  action,
  defaults,
  mode,
}: {
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
        placeholder="e.g. First Year (Regular)"
        defaultValue={defaults?.name}
      />

      <div className="form-grid">
        <div>
          <label className="field-label" htmlFor="programYear">
            Year
          </label>
          <select
            id="programYear"
            name="programYear"
            className="field-input"
            defaultValue={defaults?.programYear ?? ""}
          >
            <option value="">Not year-specific</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
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
        Fee components (PKR) — matches the approved fee structure. The total
        is calculated automatically.
      </p>

      <div className="form-grid">
        <div>
          <label className="field-label" htmlFor="admissionFee">
            Admission fee (yearly)
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
        <div>
          <label className="field-label" htmlFor="tuitionFee">
            Tuition fee (yearly)
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
      </div>

      <div className="form-grid">
        <div>
          <label className="field-label" htmlFor="boardRegistrationFee">
            Board registration fee (yearly)
          </label>
          <input
            id="boardRegistrationFee"
            name="boardRegistrationFee"
            type="number"
            min="0"
            step="1"
            className="field-input"
            defaultValue={defaults?.boardRegistrationFee ?? 0}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="collegeCardFee">
            College card fee (once)
          </label>
          <input
            id="collegeCardFee"
            name="collegeCardFee"
            type="number"
            min="0"
            step="1"
            className="field-input"
            defaultValue={defaults?.collegeCardFee ?? 0}
          />
        </div>
      </div>

      <div className="form-grid">
        <div>
          <label className="field-label" htmlFor="migrationFee">
            Migration fee (once)
          </label>
          <input
            id="migrationFee"
            name="migrationFee"
            type="number"
            min="0"
            step="1"
            className="field-input"
            defaultValue={defaults?.migrationFee ?? 0}
          />
        </div>
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
      </div>

      <div className="form-grid">
        <div>
          <label className="field-label" htmlFor="studyTourFee">
            Study tour
          </label>
          <input
            id="studyTourFee"
            name="studyTourFee"
            type="number"
            min="0"
            step="1"
            className="field-input"
            defaultValue={defaults?.studyTourFee ?? 0}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="miscellaneousFee">
            Miscellaneous (yearly)
          </label>
          <input
            id="miscellaneousFee"
            name="miscellaneousFee"
            type="number"
            min="0"
            step="1"
            className="field-input"
            defaultValue={defaults?.miscellaneousFee ?? 0}
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
