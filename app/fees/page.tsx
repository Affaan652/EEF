import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/app/_components/site-header";
import { SiteFooter } from "@/app/_components/site-footer";

export const metadata: Metadata = {
  title: "Fee Structure — EEF Polytechnic Institute of Haripur",
  description:
    "Fee structure for EEF Polytechnic Institute of Haripur, Session 2026-27 — First Year, Education Employees' sons, and DIT.",
};

type FeeRow = { label: string; amount: string };

function FeeTable({
  rows,
  total,
}: {
  rows: FeeRow[];
  total: string;
}) {
  return (
    <div className="fee-table-wrap">
      <table className="fee-table">
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td>{r.label}</td>
              <td className="fee-table-amount">{r.amount}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Total payable amount</td>
            <td className="fee-table-amount">{total}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default function FeesPage() {
  return (
    <>
      <SiteHeader />

      <div className="content-page-header">
        <div className="content-page-eyebrow">Session 2026-27</div>
        <h1 className="content-page-title">Fee structure</h1>
        <p className="content-page-lede">
          Fees for DAE programs (Civil, Electrical, Mechanical) and the
          Diploma in Information Technology (DIT), as approved for the
          2026-27 session.
        </p>
      </div>

      <div className="content-body">
        <div className="content-section">
          <h2 className="content-section-title">
            DAE — First year (regular)
          </h2>
          <hr className="content-section-rule" />
          <FeeTable
            rows={[
              { label: "Admission fee (yearly)", amount: "Rs 3,000" },
              { label: "Tuition fee (yearly)", amount: "Rs 19,800" },
              { label: "Board registration fee (yearly)", amount: "Rs 3,500" },
              { label: "College card fee (once)", amount: "Rs 100" },
              { label: "Migration fee (once)", amount: "Rs 2,000" },
              { label: "Sports fee", amount: "Rs 200" },
              { label: "Study tour", amount: "Rs 200" },
              { label: "Miscellaneous (yearly)", amount: "Rs 1,000" },
            ]}
            total="Rs 29,800"
          />
          <div className="content-callout" style={{ marginTop: 16 }}>
            <strong>Payment schedule:</strong> 50% of dues is payable at the
            time of admission. The remaining 50% is due between{" "}
            <strong>1 December 2026 and 30 December 2026</strong>.
          </div>
        </div>

        <div className="content-section">
          <h2 className="content-section-title">
            DAE — First year (Education Employees' sons)
          </h2>
          <hr className="content-section-rule" />
          <FeeTable
            rows={[
              { label: "Admission fee (yearly)", amount: "Rs 3,000" },
              { label: "Tuition fee (yearly)", amount: "Rs 9,900" },
              { label: "Board registration fee (yearly)", amount: "Rs 3,500" },
              { label: "College card fee (once)", amount: "Rs 100" },
              {
                label: "Migration verification fee (once)",
                amount: "Rs 2,000",
              },
              { label: "Sports fee", amount: "Rs 200" },
              { label: "Study tour", amount: "Rs 200" },
              { label: "Miscellaneous (yearly)", amount: "Rs 1,000" },
            ]}
            total="Rs 19,900"
          />
          <div className="content-callout" style={{ marginTop: 16 }}>
            <strong>Payment schedule:</strong> Sons of Education Employees
            Foundation employees pay the full amount at the time of
            admission.
          </div>
        </div>

        <div className="content-section">
          <h2 className="content-section-title">
            DIT — Diploma in Information Technology
          </h2>
          <hr className="content-section-rule" />
          <FeeTable
            rows={[
              { label: "Admission fee", amount: "Rs 2,000" },
              { label: "Registration fee", amount: "Rs 3,500" },
              { label: "1st semester tuition fee", amount: "Rs 6,000" },
              { label: "2nd semester tuition fee", amount: "Rs 6,000" },
            ]}
            total="Rs 17,500"
          />
        </div>

        <div className="content-section">
          <div className="content-callout">
            Fees are subject to revision by the Higher Education Department,
            Government of Khyber Pakhtunkhwa. For the latest fee vouchers
            and payment confirmation, visit the accounts office at the
            campus.
          </div>
        </div>

        <div className="content-cta">
          <Link href="/apply" className="btn-primary">
            Apply for admission
          </Link>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
