import Link from "next/link";
import { getFeeStructuresList } from "@/lib/queries/admin-lists";
import { getAdminRoute } from "@/lib/auth";
import { BarChart } from "@/app/admin/_components/bar-chart";

export const dynamic = "force-dynamic";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function FeesPage({
  searchParams,
}: {
  searchParams: { created?: string; updated?: string; deleted?: string; error?: string };
}) {
  const { structures, totalCollected, totalOutstanding } =
    await getFeeStructuresList();
  const base = `/${getAdminRoute()}`;

  const structureBars = structures.slice(0, 8).map((f) => ({
    label: f.name,
    value: f.totalAmount,
    displayValue: formatCurrency(f.totalAmount),
    tone: "navy" as const,
  }));

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Finance</div>
        <h1 className="main-title">Fees</h1>
      </div>
      <hr className="ledger-rule" />

      {searchParams.created && (
        <div className="banner banner-good">Fee structure added.</div>
      )}
      {searchParams.updated && (
        <div className="banner banner-good">Fee structure updated.</div>
      )}
      {searchParams.deleted && (
        <div className="banner banner-good">Fee structure deleted.</div>
      )}
      {searchParams.error && (
        <div className="banner banner-bad">{searchParams.error}</div>
      )}

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

      <div className="panel">
        <h2 className="panel-title">Collected vs. outstanding</h2>
        <BarChart
          emptyLabel="No fee activity recorded yet."
          data={[
            {
              label: "Collected",
              value: totalCollected,
              displayValue: formatCurrency(totalCollected),
              tone: "good",
            },
            {
              label: "Outstanding",
              value: totalOutstanding,
              displayValue: formatCurrency(totalOutstanding),
              tone: "rust",
            },
          ]}
        />
      </div>

      {structureBars.length > 0 && (
        <div className="panel">
          <h2 className="panel-title">Fee structures by total amount</h2>
          <BarChart emptyLabel="No fee structures yet." data={structureBars} />
        </div>
      )}

      <div className="table-toolbar">
        <span className="table-count">
          {structures.length} fee structure(s)
        </span>
        <Link href={`${base}/fees/new`} className="btn-primary btn-small">
          Add fee structure
        </Link>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Structure</th>
              <th>Year</th>
              <th>Total amount</th>
              <th>Due date</th>
              <th>Students assigned</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {structures.length === 0 ? (
              <tr>
                <td colSpan={7} className="meta">
                  No fee structures on record yet.
                </td>
              </tr>
            ) : (
              structures.map((f: (typeof structures)[number]) => (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td className="meta">
                    {f.programYear
                      ? `${f.programYear}${
                          f.programYear === 1
                            ? "st"
                            : f.programYear === 2
                            ? "nd"
                            : "rd"
                        } Year`
                      : "-"}
                  </td>
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
                  <td>
                    <Link href={`${base}/fees/${f.id}`} className="table-link">
                      Edit
                    </Link>
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
