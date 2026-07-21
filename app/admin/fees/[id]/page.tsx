import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  updateFeeStructureAction,
  deleteFeeStructureAction,
} from "@/lib/actions/fee-admin";
import { FeeStructureForm } from "@/app/admin/_components/fee-form";

export const dynamic = "force-dynamic";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function EditFeeStructurePage({
  params,
}: {
  params: { id: string };
}) {
  const [structure, academicYears, departments] = await Promise.all([
    prisma.feeStructure.findUnique({
      where: { id: params.id },
      include: { _count: { select: { studentFees: true } } },
    }),
    prisma.academicYear.findMany({
      select: { id: true, label: true },
      orderBy: { startDate: "desc" },
    }),
    prisma.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!structure) {
    notFound();
  }

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Finance / Fees</div>
        <h1 className="main-title">{structure.name}</h1>
      </div>
      <hr className="ledger-rule" />

      <div className="panel" style={{ maxWidth: 640 }}>
        <h2 className="panel-title">Edit fee structure</h2>
        <FeeStructureForm
          academicYears={academicYears}
          departments={departments}
          action={updateFeeStructureAction}
          mode="edit"
          defaults={{
            id: structure.id,
            name: structure.name,
            academicYearId: structure.academicYearId,
            departmentId: structure.departmentId,
            dueDate: toDateInputValue(structure.dueDate),
            isActive: structure.isActive,
            tuitionFee: structure.tuitionFee,
            admissionFee: structure.admissionFee,
            examFee: structure.examFee,
            libraryFee: structure.libraryFee,
            sportsFee: structure.sportsFee,
            otherFee: structure.otherFee,
          }}
        />
      </div>

      <div className="panel panel-danger" style={{ maxWidth: 640 }}>
        <h2 className="panel-title">Delete fee structure</h2>
        <p className="field-hint">
          {structure._count.studentFees > 0
            ? `This structure has ${structure._count.studentFees} student(s) assigned. Deletion is blocked until those are cleared.`
            : "This removes the fee structure. This cannot be undone."}
        </p>
        <form action={deleteFeeStructureAction}>
          <input type="hidden" name="feeStructureId" value={structure.id} />
          <button type="submit" className="btn-danger">
            Delete fee structure
          </button>
        </form>
      </div>
    </>
  );
}
