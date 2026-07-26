import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteStudentAction } from "@/lib/actions/student-admin";
import {
  assignFeeStructureAction,
  recordPaymentAction,
  deleteStudentFeeAction,
  deletePaymentAction,
} from "@/lib/actions/fee-payment-admin";
import { getAdminRoute } from "@/lib/auth";

export const dynamic = "force-dynamic";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_TONE: Record<string, string> = {
  PAID: "good",
  PARTIALLY_PAID: "neutral",
  UNPAID: "rust",
  OVERDUE: "rust",
  WAIVED: "neutral",
};

export default async function ViewStudentPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: {
    updated?: string;
    error?: string;
    feeAssigned?: string;
    paymentRecorded?: string;
    feeRemoved?: string;
    paymentRemoved?: string;
  };
}) {
  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      department: { select: { name: true } },
      classes: {
        where: { isActive: true },
        take: 1,
        include: {
          class: {
            select: {
              name: true,
              section: true,
              academicYear: { select: { label: true } },
            },
          },
        },
      },
      feeStructures: {
        orderBy: { createdAt: "desc" },
        include: {
          feeStructure: { select: { name: true, totalAmount: true } },
          payments: { orderBy: { paidAt: "desc" } },
        },
      },
    },
  });

  if (!student) {
    notFound();
  }

  const assignedStructureIds = student.feeStructures.map((sf) => sf.feeStructureId);
  const availableStructures = await prisma.feeStructure.findMany({
    where: { isActive: true, id: { notIn: assignedStructureIds } },
    select: { id: true, name: true, totalAmount: true },
    orderBy: { name: "asc" },
  });

  const base = `/${getAdminRoute()}`;
  const currentClass = student.classes[0]?.class;

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Records / Students</div>
        <h1 className="main-title">
          {student.firstName} {student.lastName}
        </h1>
      </div>
      <hr className="ledger-rule" />

      {searchParams.updated && (
        <div className="banner banner-good">Student record updated.</div>
      )}
      {searchParams.feeAssigned && (
        <div className="banner banner-good">Fee structure assigned.</div>
      )}
      {searchParams.paymentRecorded && (
        <div className="banner banner-good">Payment recorded.</div>
      )}
      {searchParams.feeRemoved && (
        <div className="banner banner-good">Fee assignment removed.</div>
      )}
      {searchParams.paymentRemoved && (
        <div className="banner banner-good">Payment removed.</div>
      )}
      {searchParams.error && (
        <div className="banner banner-bad">{searchParams.error}</div>
      )}

      <div className="panel" style={{ maxWidth: 640 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <h2 className="panel-title" style={{ margin: 0 }}>
            Profile
          </h2>
          <Link
            href={`${base}/students/${student.id}/edit`}
            className="btn-ghost btn-small"
          >
            Edit
          </Link>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Roll number</span>
          <span className="panel-row-meta">{student.rollNumber}</span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Gender</span>
          <span className="panel-row-meta">{student.gender}</span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Date of birth</span>
          <span className="panel-row-meta">{formatDate(student.dateOfBirth)}</span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Department</span>
          <span className="panel-row-meta">
            {student.department?.name ?? "Unassigned"}
          </span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Class</span>
          <span className="panel-row-meta">
            {currentClass
              ? `${currentClass.name}${
                  currentClass.section ? ` - ${currentClass.section}` : ""
                } (${currentClass.academicYear.label})`
              : "Not assigned"}
          </span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Enrolled years</span>
          <span className="panel-row-meta">
            {student.yearStart && student.yearEnd
              ? `${student.yearStart} - ${student.yearEnd}`
              : "Not set"}
          </span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Admitted</span>
          <span className="panel-row-meta">{formatDate(student.admissionDate)}</span>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: 640 }}>
        <h2 className="panel-title">Contact</h2>
        <div className="panel-row">
          <span className="panel-row-title">Phone</span>
          <span className="panel-row-meta">{student.phone ?? "Not provided"}</span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">WhatsApp</span>
          <span className="panel-row-meta">
            {student.whatsappNumber ?? "Not provided"}
          </span>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: 640 }}>
        <h2 className="panel-title">Guardian</h2>
        <div className="panel-row">
          <span className="panel-row-title">Name</span>
          <span className="panel-row-meta">
            {student.guardianName ?? "Not provided"}
          </span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Phone</span>
          <span className="panel-row-meta">
            {student.guardianPhone ?? "Not provided"}
          </span>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: 640 }}>
        <h2 className="panel-title">Fees</h2>

        {student.feeStructures.length === 0 ? (
          <p className="panel-empty">No fee structures assigned yet.</p>
        ) : (
          student.feeStructures.map((sf) => (
            <div key={sf.id} className="fee-block">
              <div className="fee-block-header">
                <div>
                  <div className="panel-row-title">{sf.feeStructure.name}</div>
                  <div className="panel-row-meta">
                    Total {formatCurrency(sf.feeStructure.totalAmount)} · Paid{" "}
                    {formatCurrency(sf.paidAmount)} · Remaining{" "}
                    {formatCurrency(sf.remainingAmount)}
                  </div>
                </div>
                <span className={`status-pill ${STATUS_TONE[sf.status] ?? "neutral"}`}>
                  {sf.status.replace("_", " ")}
                </span>
              </div>

              {sf.payments.length > 0 && (
                <div className="fee-payment-list">
                  {sf.payments.map((p) => (
                    <div className="fee-payment-row" key={p.id}>
                      <span>
                        {formatCurrency(p.amount)} · {p.paymentMethod} ·{" "}
                        {formatDate(p.paidAt)}
                      </span>
                      <form action={deletePaymentAction}>
                        <input type="hidden" name="studentId" value={student.id} />
                        <input type="hidden" name="paymentId" value={p.id} />
                        <button type="submit" className="table-link-danger">
                          Remove
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}

              {sf.remainingAmount > 0 && (
                <form action={recordPaymentAction} className="fee-payment-form">
                  <input type="hidden" name="studentId" value={student.id} />
                  <input type="hidden" name="studentFeeId" value={sf.id} />
                  <input
                    type="number"
                    name="amount"
                    min="1"
                    step="1"
                    placeholder="Amount"
                    className="field-input"
                    required
                  />
                  <select name="paymentMethod" className="field-input">
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank transfer</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="ONLINE">Online</option>
                  </select>
                  <button type="submit" className="btn-primary btn-small">
                    Record payment
                  </button>
                </form>
              )}

              {sf.payments.length === 0 && (
                <form
                  action={deleteStudentFeeAction}
                  style={{ marginTop: 10 }}
                >
                  <input type="hidden" name="studentId" value={student.id} />
                  <input type="hidden" name="studentFeeId" value={sf.id} />
                  <button type="submit" className="table-link-danger">
                    Remove this fee assignment
                  </button>
                </form>
              )}
            </div>
          ))
        )}

        {availableStructures.length > 0 && (
          <form
            action={assignFeeStructureAction}
            className="fee-assign-form"
          >
            <input type="hidden" name="studentId" value={student.id} />
            <select name="feeStructureId" className="field-input" required>
              <option value="">Assign a fee structure...</option>
              {availableStructures.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({formatCurrency(s.totalAmount)})
                </option>
              ))}
            </select>
            <button type="submit" className="btn-primary btn-small">
              Assign
            </button>
          </form>
        )}
      </div>

      <div className="panel panel-danger" style={{ maxWidth: 640 }}>
        <h2 className="panel-title">Delete record</h2>
        <p className="field-hint">
          This removes the student record. If the student has linked fees or
          attendance, deletion is blocked until those are cleared. This
          cannot be undone.
        </p>
        <form action={deleteStudentAction}>
          <input type="hidden" name="studentId" value={student.id} />
          <button type="submit" className="btn-danger">
            Delete student record
          </button>
        </form>
      </div>
    </>
  );
}
