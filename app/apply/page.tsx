"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logo.png";
import { submitApplicationAction, type ApplyState } from "@/lib/actions/apply";

const initialState: ApplyState = {};

const PROGRAMS = [
  "DAE Civil Technology",
  "DAE Electrical Technology",
  "DAE Mechanical Technology",
  "Diploma in Information Technology (DIT) — 1 Year",
  "Diploma in Information Technology (DIT) — 2 Years",
];

const REQUIRED_DOCUMENTS = [
  {
    id: "dmcFile",
    label: "SSC (Matric) Detailed Marks Certificate (DMC)",
    hint: "Upload a clear scan or photo. Bring 4 physical photocopies when you visit the office.",
    accept: "image/jpeg,image/png,image/webp,application/pdf",
  },
  {
    id: "bformFile",
    label: "Student's B-Form",
    hint: "Upload a clear scan or photo (JPG, PNG, or PDF).",
    accept: "image/jpeg,image/png,image/webp,application/pdf",
  },
  {
    id: "cnicFile",
    label: "Father's CNIC",
    hint: "Upload a clear scan or photo (JPG, PNG, or PDF).",
    accept: "image/jpeg,image/png,image/webp,application/pdf",
  },
  {
    id: "photoFile",
    label: "Passport-size photograph",
    hint: "Upload one recent photo. Bring 6 physical prints when you visit the office.",
    accept: "image/jpeg,image/png,image/webp",
  },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Submitting..." : "Submit application"}
    </button>
  );
}

export default function ApplyPage() {
  const [state, formAction] = useFormState(submitApplicationAction, initialState);

  if (state.success) {
    return (
      <div className="auth-page">
        <div className="auth-letterhead">
          <Image src={logo} alt="EEF College logo" className="auth-seal" width={40} height={40} priority />
          <div>
            <div className="auth-letterhead-title">EEF Polytechnic Institute</div>
            <div className="auth-letterhead-sub">Admission Application</div>
          </div>
        </div>
        <div className="auth-card" style={{ maxWidth: 480 }}>
          <h1 className="auth-title">Application received</h1>
          <p className="auth-subtitle">
            Your application number is{" "}
            <code style={{ fontFamily: "var(--font-mono)" }}>
              {state.applicationNumber}
            </code>
            . Save this number. Your documents have been submitted online —
            please still bring the original SSC (Matric) DMC (4
            photocopies) and 6 passport-size photographs when you visit the
            admissions office. The registrar will contact you by email or
            phone about the next steps.
          </p>
          <Link href="/" className="btn-primary" style={{ width: "100%" }}>
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-letterhead">
        <Image src={logo} alt="EEF College logo" className="auth-seal" width={40} height={40} priority />
        <div>
          <div className="auth-letterhead-title">EEF Polytechnic Institute</div>
          <div className="auth-letterhead-sub">Admission Application</div>
        </div>
      </div>

      <div className="auth-card" style={{ maxWidth: 640 }}>
        <h1 className="auth-title">Apply for admission</h1>
        <p className="auth-subtitle">
          Fill in your details below. Fields marked with * are required.
        </p>

        <form action={formAction} className="admin-form">
          {state.error && <p className="field-error">{state.error}</p>}

          <h2 className="panel-title" style={{ fontSize: 16, marginTop: 8 }}>
            Personal information
          </h2>
          <div className="form-grid">
            <div>
              <label className="field-label" htmlFor="firstName">
                First name *
              </label>
              <input id="firstName" name="firstName" required className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="lastName">
                Last name *
              </label>
              <input id="lastName" name="lastName" required className="field-input" />
            </div>
          </div>

          <div className="form-grid">
            <div>
              <label className="field-label" htmlFor="dateOfBirth">
                Date of birth *
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="gender">
                Gender *
              </label>
              <select id="gender" name="gender" required className="field-input">
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div>
              <label className="field-label" htmlFor="nationality">
                Nationality
              </label>
              <input id="nationality" name="nationality" className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="cnic">
                B-Form number
              </label>
              <input id="cnic" name="cnic" className="field-input" />
            </div>
          </div>

          <h2 className="panel-title" style={{ fontSize: 16, marginTop: 20 }}>
            Contact information
          </h2>
          <label className="field-label" htmlFor="email">
            Email address *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="field-input"
          />

          <div className="form-grid">
            <div>
              <label className="field-label" htmlFor="phone">
                Phone number *
              </label>
              <input id="phone" name="phone" required className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="city">
                City *
              </label>
              <input id="city" name="city" required className="field-input" />
            </div>
          </div>

          <div className="form-grid">
            <div>
              <label className="field-label" htmlFor="province">
                Province *
              </label>
              <input id="province" name="province" required className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="address">
                Address *
              </label>
              <input id="address" name="address" required className="field-input" />
            </div>
          </div>

          <h2 className="panel-title" style={{ fontSize: 16, marginTop: 20 }}>
            Guardian information
          </h2>
          <div className="form-grid">
            <div>
              <label className="field-label" htmlFor="guardianName">
                Guardian name *
              </label>
              <input
                id="guardianName"
                name="guardianName"
                required
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="guardianRelation">
                Relation *
              </label>
              <input
                id="guardianRelation"
                name="guardianRelation"
                required
                className="field-input"
                placeholder="Father / Mother / Guardian"
              />
            </div>
          </div>

          <div className="form-grid">
            <div>
              <label className="field-label" htmlFor="guardianPhone">
                Guardian phone *
              </label>
              <input
                id="guardianPhone"
                name="guardianPhone"
                required
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="guardianCnic">
                Father&apos;s CNIC *
              </label>
              <input
                id="guardianCnic"
                name="guardianCnic"
                required
                className="field-input"
                placeholder="XXXXX-XXXXXXX-X"
              />
            </div>
          </div>

          <label className="field-label" htmlFor="guardianOccupation">
            Guardian occupation
          </label>
          <input
            id="guardianOccupation"
            name="guardianOccupation"
            className="field-input"
          />

          <h2 className="panel-title" style={{ fontSize: 16, marginTop: 20 }}>
            Academic information
          </h2>
          <p className="field-hint" style={{ margin: "0 0 12px" }}>
            Eligibility: passed SSC (Matric) with Science, with a minimum of
            40% marks.
          </p>
          <label className="field-label" htmlFor="desiredProgram">
            Program you are applying to *
          </label>
          <select
            id="desiredProgram"
            name="desiredProgram"
            required
            className="field-input"
          >
            <option value="">Select a program</option>
            {PROGRAMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <div className="form-grid">
            <div>
              <label className="field-label" htmlFor="previousSchool">
                School (SSC / Matric) *
              </label>
              <input
                id="previousSchool"
                name="previousSchool"
                required
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="previousGrade">
                SSC marks obtained (%) *
              </label>
              <input
                id="previousGrade"
                name="previousGrade"
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                className="field-input"
                placeholder="e.g. 65"
              />
            </div>
          </div>

          <h2 className="panel-title" style={{ fontSize: 16, marginTop: 20 }}>
            Required documents
          </h2>
          <p className="field-hint" style={{ margin: "0 0 12px" }}>
            Upload a clear scan or photo of each document below (JPG, PNG, or
            PDF, max 5MB each).
          </p>
          <div className="document-upload-list">
            {REQUIRED_DOCUMENTS.map((doc) => (
              <div className="document-upload-item" key={doc.id}>
                <label className="field-label" htmlFor={doc.id}>
                  {doc.label} *
                </label>
                <input
                  id={doc.id}
                  name={doc.id}
                  type="file"
                  accept={doc.accept}
                  required
                  className="field-input field-file-input"
                />
                <p className="field-hint">{doc.hint}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 22 }}>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
