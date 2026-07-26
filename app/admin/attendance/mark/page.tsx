import Link from "next/link";
import {
  getClassOptions,
  getClassStudentsWithAttendance,
} from "@/lib/queries/admin-lists";
import { markAttendanceAction } from "@/lib/actions/attendance-admin";
import { getAdminRoute } from "@/lib/auth";
import { shortClassLabel } from "@/lib/class-label";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "LATE", label: "Late" },
  { value: "EXCUSED", label: "Excused" },
];

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export default async function MarkAttendancePage({
  searchParams,
}: {
  searchParams: { classId?: string; date?: string; saved?: string; error?: string };
}) {
  const base = `/${getAdminRoute()}`;
  const classOptions = await getClassOptions();
  const classId = searchParams.classId ?? "";
  const date = searchParams.date ?? todayInputValue();

  const students =
    classId && date
      ? await getClassStudentsWithAttendance(classId, new Date(date))
      : [];

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Academics / Attendance</div>
        <h1 className="main-title">Mark attendance</h1>
      </div>
      <hr className="ledger-rule" />

      {searchParams.saved && (
        <div className="banner banner-good">Attendance saved.</div>
      )}
      {searchParams.error && (
        <div className="banner banner-bad">{searchParams.error}</div>
      )}

      <div className="panel" style={{ maxWidth: 640 }}>
        <form method="GET" className="admin-form">
          <div className="form-grid">
            <div>
              <label className="field-label" htmlFor="classId">
                Class
              </label>
              <select
                id="classId"
                name="classId"
                required
                className="field-input"
                defaultValue={classId}
              >
                <option value="">Select a class</option>
                {classOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {shortClassLabel(c.name)} ({c.academicYear.label})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                required
                className="field-input"
                defaultValue={date}
              />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <button type="submit" className="btn-primary btn-small">
              Load class
            </button>
          </div>
        </form>
      </div>

      {classId && date && (
        <div className="panel" style={{ maxWidth: 640 }}>
          {students.length === 0 ? (
            <p className="panel-empty">
              No active students are assigned to this class yet.
            </p>
          ) : (
            <form action={markAttendanceAction}>
              <input type="hidden" name="classId" value={classId} />
              <input type="hidden" name="date" value={date} />

              <div className="table-wrap" style={{ boxShadow: "none" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Roll no.</th>
                      <th>Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id}>
                        <td>{s.rollNumber}</td>
                        <td>
                          {s.firstName} {s.lastName}
                        </td>
                        <td>
                          <input type="hidden" name="studentId" value={s.id} />
                          <select
                            name={`status_${s.id}`}
                            className="field-input"
                            defaultValue={s.status}
                            style={{ minHeight: 38, padding: "6px 10px" }}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                <button type="submit" className="btn-primary">
                  Save attendance
                </button>
                <Link href={`${base}/attendance`} className="btn-ghost">
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}
