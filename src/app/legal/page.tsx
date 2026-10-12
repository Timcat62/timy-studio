import type { Metadata } from "next";
import { site } from "@/lib/config";

export const metadata: Metadata = { title: "Legal and terms" };

// Complete every [bracketed] field before going live, and have the terms reviewed by a professional.
export default function Legal() {
  return (
    <>
      <div className="wrap page-head">
        <h1 className="display">Legal and terms</h1>
      </div>
      <section className="section section--tight" style={{ borderTop: 0 }}>
        <div className="wrap prose">
          <h2 id="publisher">Publisher</h2>
          <p>
            {site.name} ({site.domain}), operated by [full name], sole proprietor, [business address], SIRET [number].
            Contact: <a href={`mailto:${site.email}`}>{site.email}</a>. Hosting: [Vercel Inc., 440 N Barranca Ave #4133,
            Covina, CA 91723, USA].
          </p>

          <h2 id="terms">Terms of service</h2>
          <p>
            <strong>How a project works.</strong> Each project starts with a brief sent through this site. I reply in the
            project chat with questions and a proposal. Nothing is due until we have agreed on a final price in that
            chat.
          </p>
          <p>
            <strong>Price and payment.</strong> The final price is set by me, in euros, [VAT status]. You pay it in full
            through Stripe, using the payment methods offered at checkout, before production starts. Stripe emails you a
            receipt and an invoice.
          </p>
          <p>
            <strong>Revisions and delivery.</strong> The number of revision rounds, the formats and the delivery date are
            agreed in the chat before you pay. Files are delivered through your project page or by link.
          </p>
          <p>
            <strong>Rights.</strong> Unless we agree otherwise in writing, you receive the right to use the final files
            for the purpose we agreed, and I may show the work in my portfolio and on my social accounts.
          </p>
          <p>
            <strong>Cancellation and withdrawal.</strong> You can cancel for a full refund before production starts. Each
            project is made to your specifications and begins right after payment, so once production has started, and as
            consumer law allows for custom work, the right of withdrawal no longer applies. [Review this wording.]
          </p>

          <h2 id="privacy">Privacy</h2>
          <p>
            I store your name, email, brief, files and messages only to handle your request and to keep a record of the
            project, for [duration] after it ends. They are hosted with Supabase. Payments are processed by Stripe, which
            handles your card data; I never see it. Fonts are served from this site, and no advertising trackers are used.
            To access or delete your data, write to <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
