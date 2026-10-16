import type { Metadata } from "next";
import { legal, site } from "@/lib/config";

export const metadata: Metadata = { title: "Legal and terms" };

// The publisher details come from `legal` in src/lib/config.ts.
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
            {site.name} ({site.domain}) is published by {legal.name}, {legal.status}
            {legal.address ? `, ${legal.address}` : ""}. SIRET: {legal.siret || "registration in progress"}. Contact:{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>
            {legal.phone ? `, ${legal.phone}` : ""}. Publication director: {legal.name}.
          </p>
          <p>
            <strong>Hosting.</strong> The site runs on a server operated by the publisher, in France (contact
            details above). The project database and the files you send are stored by Supabase, Inc. (supabase.com), and
            payments are handled by Stripe Payments Europe, Ltd. (stripe.com).
          </p>

          <h2 id="terms">Terms of service</h2>
          <p>
            <strong>How a project works.</strong> Each project starts with a brief sent through this site. I reply in the
            project chat with questions and a proposal. Nothing is due until we have agreed on a final price in that
            chat.
          </p>
          <p>
            <strong>Price and payment.</strong> The final price is set by me, in euros. {legal.vat} You pay it in full
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
            <strong>Cancellation and right of withdrawal.</strong> If you are a consumer, you have 14 days after paying to
            withdraw, by writing to <a href={`mailto:${site.email}`}>{site.email}</a>. When you pay, you ask me to start
            work right away, before those 14 days are over. If you then withdraw, you pay for the work already done and the
            rest is refunded. Once the work is fully delivered, the right of withdrawal no longer applies (French Consumer
            Code, articles L221-25 and L221-28). Before production starts, you can always cancel for a full refund.
          </p>
          <p>
            <strong>Disputes.</strong> Write to me first and we will find a solution.
            {legal.mediator
              ? ` If we can't agree, as a consumer you may refer the dispute free of charge to the mediator ${legal.mediator}.`
              : ""}{" "}
            These terms are governed by French law.
          </p>

          <h2 id="privacy">Privacy</h2>
          <p>
            <strong>What I keep and why.</strong> Your name, email, brief, files and messages, only to handle your project
            and keep a record of it. If you create an account, your email and an encrypted password (or your Google
            sign-in) so you can find your projects again. Everything is kept for 3 years after our last exchange, except
            invoices, which the law requires to be kept for 10 years. Your data is never sold or shared for advertising.
          </p>
          <p>
            <strong>Who handles it.</strong> Supabase stores the data and files, Stripe processes payments (I never see
            your card details), and Resend sends the emails about your project.
          </p>
          <p>
            <strong>Visit statistics.</strong> To know which pages are read, the server notes the page, the approximate city
            and country, the type of device and the time spent. Nothing is stored on your device for this, and it is not
            linked to you.
          </p>
          <p>
            <strong>Cookies.</strong> This site only uses cookies that are needed for it to work: one keeps you signed in
            to your account, and one keeps the studio signed in to the admin area. No advertising or tracking cookies, so
            there is nothing to accept. Videos are YouTube embeds in privacy-enhanced mode: nothing loads from YouTube
            until you press play (the preview images do come from YouTube's servers).
          </p>
          <p>
            <strong>Your rights.</strong> You can access, correct, export or delete your data at any time by writing to{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>. You can also file a complaint with the CNIL (cnil.fr).
          </p>
        </div>
      </section>
    </>
  );
}
