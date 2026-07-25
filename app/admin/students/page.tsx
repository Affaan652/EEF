import Link from "next/link";
import {
  getStudentsList,
  getStudentsGroupedByClass,
  getClassOptions,
} from "@/lib/queries/admin-lists";
import { getAdminRoute } from "@/lib/auth";
import { shortClassLabel } from "@/lib/class-label";

export const dynamic = "force-dynamic";

type StudentRow = {
  id: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  whatsappNumber: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  department: { name: string } | null;
  admissionDate: Date;
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StudentTable({
  students,
  base,
  emptyLabel,
}: {
  students: StudentRow[];
  base: string;
  emptyLabel: string;
}) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Roll no.</th>
            <th>Name</th>
            <th>Department</th>
            <th>WhatsApp</th>
            <th>Guardian</th>
            <th>Admitted</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan={7} className="meta">
                {emptyLabel}
              </td>
            </tr>
          ) : (
            students.map((s) => (
              <tr key={s.id}>
                <td>{s.rollNumber}</td>
                <td>
                  {s.firstName} {s.lastName}
                </td>
                <td className="meta">{s.department?.name ?? "Unassigned"}</td>
                <td className="meta">{s.whatsappNumber ?? "-"}</td>
                <td className="meta">
                  {s.guardianName
                    ? `${s.guardianName}${
                        s.guardianPhone ? ` · ${s.guardianPhone}` : ""
                      }`
                    : "-"}
                </td>
                <td className="meta">{formatDate(s.admissionDate)}</td>
                <td>
                  <Link href={`${base}/students/${s.id}`} className="table-link">
                    View
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: {
    created?: string;
    deleted?: string;
    error?: string;
    q?: string;
    classId?: string;
    calendarYear?: string;
  };
}) {
  const base = `/${getAdminRoute()}`;
  const q = searchParams.q?.trim() ?? "";
  const classId = searchParams.classId ?? "";
  const calendarYear = searchParams.calendarYear ?? "";
  const isFiltering = Boolean(q || classId || calendarYear);

  const classOptions = await getClassOptions();
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 16 }, (_, i) => currentYear + 2 - i);

  // Fetch exactly the data this render needs: a flat filtered list when
  // searching/filtering, or the grouped-by-class view otherwise. Both are
  // resolved up front (this is an async Server Component) rather than
  // awaited inline inside JSX, which React can't do.
  const flatStudents = isFiltering
    ? await getStudentsList({ q, classId, calendarYear })
    : null;
  const grouped = isFiltering ? null : await getStudentsGroupedByClass();
  const nonEmptyClasses = grouped
    ? grouped.classes.filter((c) => c.students.length > 0)
    : [];

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Records</div>
        <h1 className="main-title">Students</h1>
      </div>
      <hr className="ledger-rule" />

      {searchParams.created && (
        <div className="banner banner-good">Student record added.</div>
      )}
      {searchParams.deleted && (
        <div className="banner banner-good">Student record deleted.</div>
      )}
      {searchParams.error && (
        <div className="banner banner-bad">{searchParams.error}</div>
      )}

      <div className="table-toolbar">
        <form method="GET" className="student-search-form">
          <select name="classId" className="field-input" defaultValue={classId}>
            <option value="">All classes</option>
            {classOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {shortClassLabel(c.name)}
              </option>
            ))}
          </select>
          <select
            name="calendarYear"
            className="field-input"
            defaultValue={calendarYear}
          >
            <option value="">All years</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search name or roll number"
            className="field-input"
          />
          <button type="submit" className="btn-primary btn-small">
            Search
          </button>
          {isFiltering && (
            <Link href={`${base}/students`} className="btn-ghost btn-small">
              Clear
            </Link>
          )}
        </form>
        <Link href={`${base}/students/new`} className="btn-primary btn-small">
          Add student
        </Link>
      </div>

      {flatStudents && (
        <>
          <p className="table-count" style={{ marginBottom: 10 }}>
            {flatStudents.length} result(s)
          </p>
          <StudentTable
            students={flatStudents}
            base={base}
            emptyLabel="No students match this search."
          />
        </>
      )}

      {grouped && (
        <>
          {nonEmptyClasses.length === 0 && grouped.unassigned.length === 0 && (
            <StudentTable
              students={[]}
              base={base}
              emptyLabel="No students on record yet."
            />
          )}

          {nonEmptyClasses.map((c) => (
            <div key={c.id} className="class-group">
              <div className="class-group-title">
                {c.name}
                {c.section ? ` - ${c.section}` : ""}{" "}
                <span className="class-group-meta">
                  {c.academicYear.label} · {c.students.length} student(s)
                </span>
              </div>
              <StudentTable
                students={c.students.map((sc) => sc.student)}
                base={base}
                emptyLabel="No students in this class."
              />
            </div>
          ))}

          {grouped.unassigned.length > 0 && (
            <div className="class-group">
              <div className="class-group-title">
                Unassigned{" "}
                <span className="class-group-meta">
                  {grouped.unassigned.length} student(s)
                </span>
              </div>
              <StudentTable
                students={grouped.unassigned}
                base={base}
                emptyLabel="No unassigned students."
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
