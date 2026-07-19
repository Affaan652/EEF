import { getFeeStructuresList } from "@/lib/queries/admin-lists";

export const dynamic = "force-dynamic";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function FeesPage() {
  const { structures, totalCollected, totalOutstanding } =
    await getFeeStructuresList();

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Finance</div>
        <h1 className="main-title">Fees</h1>
      </div>
      <hr className="ledger-rule" />

      <div className="record-grid">
        <div className="record-card">
          <span className="record-code">FEE-C1</span>
          <div className="record-label">Total collected (all time)</div>
          <div className="record-value good">
            {formatCurrency(totalCollected)}
          </div>
        </div>
        <div className="record-card">
          <span className="record-code">FEE-C2</span>
          <div className="record-label">Total outstanding</div>
          <div
            className={`record-value ${totalOutstanding > 0 ? "rust" : ""}`}
          >
            {formatCurrency(totalOutstanding)}
          </div>
        </div>
      </div>

      <div className="table-toolbar">
        <span className="table-count">
          {structures.length} fee structure(s)
        </span>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Structure</th>
              <th>Academic year</th>
              <th>Total amount</th>
              <th>Due date</th>
              <th>Students assigned</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {structures.length === 0 ? (
              <tr>
                <td colSpan={6} className="meta">
                  No fee structures on record yet.
                </td>
              </tr>
            ) : (
              structures.map((f: (typeof structures)[number]) => (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td className="meta">{f.academicYear.label}</td>
                  <td>{formatCurrency(f.totalAmount)}</td>
                  <td className="meta">
                    {new Date(f.dueDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="meta">{f._count.studentFees}</td>
                  <td>
                    <span
                      className={`status-pill ${f.isActive ? "good" : "neutral"}`}
                    >
                      {f.isActive ? "Active" : "Inactive"}
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
