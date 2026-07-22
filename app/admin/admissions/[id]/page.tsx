import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AdmissionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const application = await prisma.admissionApplication.findUnique({
    where: { id: params.id },
    include: {
      uploadedDocuments: {
        select: {
          id: true,
          label: true,
          fileName: true,
          mimeType: true,
          fileSize: true,
          url: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!application) {
    notFound();
  }

  return (
    <>
      <div className="main-header">
        <div className="main-eyebrow">Records / Admissions</div>
        <h1 className="main-title">
          {application.firstName} {application.lastName}
        </h1>
      </div>
      <hr className="ledger-rule" />

      <div className="panel" style={{ maxWidth: 640 }}>
        <h2 className="panel-title">Application</h2>
        <div className="panel-row">
          <span className="panel-row-title">Application #</span>
          <span className="panel-row-meta">{application.applicationNumber}</span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Program</span>
          <span className="panel-row-meta">{application.desiredProgram}</span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Status</span>
          <span className="status-pill neutral">
            {application.status.replace("_", " ")}
          </span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Email</span>
          <span className="panel-row-meta">{application.email}</span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Phone</span>
          <span className="panel-row-meta">{application.phone}</span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Guardian</span>
          <span className="panel-row-meta">
            {application.guardianName} ({application.guardianRelation}) —{" "}
            {application.guardianPhone}
          </span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">Father's CNIC</span>
          <span className="panel-row-meta">
            {application.guardianCnic ?? "Not provided"}
          </span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">SSC school</span>
          <span className="panel-row-meta">{application.previousSchool}</span>
        </div>
        <div className="panel-row">
          <span className="panel-row-title">SSC marks</span>
          <span className="panel-row-meta">
            {application.previousMarks != null
              ? `${application.previousMarks}%`
              : "Not provided"}
          </span>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: 640 }}>
        <h2 className="panel-title">Uploaded documents</h2>
        {application.uploadedDocuments.length === 0 ? (
          <p className="panel-empty">No documents were uploaded.</p>
        ) : (
          application.uploadedDocuments.map((doc: (typeof application.uploadedDocuments)[number]) => (
            <div className="panel-row" key={doc.id}>
              <div>
                <div className="panel-row-title">{doc.label}</div>
                <div className="panel-row-meta">
                  {doc.fileName} · {formatBytes(doc.fileSize)}
                </div>
              </div>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="table-link"
              >
                View
              </a>
            </div>
          ))
        )}
      </div>
    </>
  );
}
