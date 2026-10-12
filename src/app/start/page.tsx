import type { Metadata } from "next";
import { BriefForm } from "@/components/BriefForm";
import { maxFileSizeMB, maxFiles } from "@/lib/config";

export const metadata: Metadata = {
  title: "Start a project",
  description: "Send a brief for an automotive CGI or 3D animation project. Nothing to pay until we agree on a price.",
};

export default function Start() {
  return (
    <>
      <div className="wrap page-head">
        <h1 className="display">Start a project</h1>
        <p className="lede">
          Tell me what you have in mind. You won't pay anything now: we'll talk it through in a private chat, and I'll
          propose a final price once I understand the job.
        </p>
      </div>
      <section className="wrap" style={{ paddingBottom: "6rem" }}>
        <BriefForm maxFiles={maxFiles} maxFileSizeMB={maxFileSizeMB} />
      </section>
    </>
  );
}
