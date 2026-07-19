import { getAdmissionsList } from "@/lib/queries/admin-lists";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  ENROLLED: "good",
  APPROVED: "good",
  REJECTED: "rust",
  DOCUMENTS_PENDING: "neutral",
  UNDER_REVIEW: "neutral",
  SUBMITTED: "neutral",
  DRAFT: "neutral",
};

export default async function AdmissionsPage() {
  const applications = await getAdmissionsList();

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Records</div>
        <h1 className="main-title">Admissions</h1>
      </div>
      <hr className="ledger-rule" />

      <div className="table-toolbar">
        <span className="table-count">
          {applications.length} application(s)
        </span>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Application #</th>
              <th>Applicant</th>
              <th>Program</th>
              <th>Submitted</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={5} className="meta">
                  No applications on record yet.
                </td>
              </tr>
            ) : (
              applications.map((a: (typeof applications)[number]) => (
                <tr key={a.id}>
                  <td>{a.applicationNumber}</td>
                  <td>
                    {a.firstName} {a.lastName}
                    <div className="cell-meta">{a.email}</div>
                  </td>
                  <td className="meta">{a.desiredProgram}</td>
                  <td className="meta">
                    {a.submittedAt
                      ? new Date(a.submittedAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Not submitted"}
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        STATUS_TONE[a.status] ?? "neutral"
                      }`}
                    >
                      {a.status.replace("_", " ")}
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
