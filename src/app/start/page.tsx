import type { Metadata } from "next";
import { BriefForm } from "@/components/BriefForm";
import { maxFileSizeMB, maxFiles, projectTypes } from "@/lib/config";

export const metadata: Metadata = {
  title: "Start a project",
  description: "Send a brief for an automotive CGI or 3D animation project. Nothing to pay until we agree on a price.",
};

export default async function Start({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const defaultType = projectTypes.includes(type ?? "") ? (type as string) : projectTypes[0];

  return (
    <div className="wrap start-grid">
      <div className="start-grid__intro">
        <h1 className="display">Start a project</h1>
        <p className="lede">
          Tell me what you have in mind. You won't pay anything now: we'll talk it through in a private chat, and I'll
          propose a final price once I understand the job.
        </p>
        <ol className="next-steps">
          <li>You send the brief. It lands on a private page only you and I can open.</li>
          <li>We talk it through in the chat, and settle scope, timing and price.</li>
          <li>Once you accept the price, you pay securely and I start.</li>
        </ol>
      </div>
      <div className="start-grid__form">
        <BriefForm maxFiles={maxFiles} maxFileSizeMB={maxFileSizeMB} defaultType={defaultType} />
      </div>
    </div>
  );
}
