import { prisma } from "@/lib/prisma";
import { createFeeStructureAction } from "@/lib/actions/fee-admin";
import { FeeStructureForm } from "@/app/admin/_components/fee-form";

export const dynamic = "force-dynamic";

export default async function NewFeeStructurePage() {
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Finance / Fees</div>
        <h1 className="main-title">Add fee structure</h1>
      </div>
      <hr className="ledger-rule" />

      <div className="panel" style={{ maxWidth: 640 }}>
        <FeeStructureForm
          departments={departments}
          action={createFeeStructureAction}
          mode="create"
        />
      </div>
    </>
  );
}
