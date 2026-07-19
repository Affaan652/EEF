import { getExamsList } from "@/lib/queries/admin-lists";

export const dynamic = "force-dynamic";

export default async function ExamsPage() {
  const exams = await getExamsList();

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Academics</div>
        <h1 className="main-title">Exams</h1>
      </div>
      <hr className="ledger-rule" />

      <div className="table-toolbar">
        <span className="table-count">{exams.length} exam(s)</span>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Course</th>
              <th>Class</th>
              <th>Scheduled</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {exams.length === 0 ? (
              <tr>
                <td colSpan={5} className="meta">
                  No exams on record yet.
                </td>
              </tr>
            ) : (
              exams.map((e: (typeof exams)[number]) => (
                <tr key={e.id}>
                  <td>{e.title}</td>
                  <td className="meta">
                    {e.course.name} ({e.course.code})
                  </td>
                  <td className="meta">
                    {e.class.name}
                    {e.class.section ? ` (${e.class.section})` : ""}
                  </td>
                  <td className="meta">
                    {new Date(e.scheduledAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        e.isPublished ? "good" : "neutral"
                      }`}
                    >
                      {e.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
