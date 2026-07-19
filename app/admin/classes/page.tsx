import { getClassesList } from "@/lib/queries/admin-lists";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const classes = await getClassesList();

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Academics</div>
        <h1 className="main-title">Classes</h1>
      </div>
      <hr className="ledger-rule" />

      <div className="table-toolbar">
        <span className="table-count">{classes.length} class(es)</span>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Academic year</th>
              <th>Classroom</th>
              <th>Students</th>
              <th>Capacity</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan={5} className="meta">
                  No classes on record yet.
                </td>
              </tr>
            ) : (
              classes.map((c: (typeof classes)[number]) => (
                <tr key={c.id}>
                  <td>
                    {c.name}
                    {c.section ? ` (${c.section})` : ""}
                  </td>
                  <td className="meta">{c.academicYear.label}</td>
                  <td className="meta">
                    {c.classroom
                      ? `${c.classroom.name}${
                          c.classroom.building ? `, ${c.classroom.building}` : ""
                        }`
                      : "Unassigned"}
                  </td>
                  <td>{c._count.students}</td>
                  <td className="meta">{c.capacity}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
