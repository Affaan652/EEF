import { getPayrollList } from "@/lib/queries/admin-lists";

export const dynamic = "force-dynamic";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function PayrollPage() {
  const logs = await getPayrollList();

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Finance</div>
        <h1 className="main-title">Payroll</h1>
      </div>
      <hr className="ledger-rule" />

      <div className="table-toolbar">
        <span className="table-count">{logs.length} payroll record(s)</span>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Staff</th>
              <th>Period</th>
              <th>Basic salary</th>
              <th>Net salary</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="meta">
                  No payroll records yet.
                </td>
              </tr>
            ) : (
              logs.map((log: (typeof logs)[number]) => (
                <tr key={log.id}>
                  <td>
                    {log.staff.firstName} {log.staff.lastName}
                    <div className="cell-meta">{log.staff.employeeCode}</div>
                  </td>
                  <td className="meta">
                    {MONTHS[log.month - 1] ?? log.month} {log.year}
                  </td>
                  <td className="meta">{formatCurrency(log.basicSalary)}</td>
                  <td>{formatCurrency(log.netSalary)}</td>
                  <td>
                    <span
                      className={`status-pill ${
                        log.status === "PAID" ? "good" : "neutral"
                      }`}
                    >
                      {log.status}
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
