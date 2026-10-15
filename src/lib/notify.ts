import { site } from "./config";
import { siteUrl } from "./format";

/** Posts to your Discord channel. Does nothing if DISCORD_WEBHOOK_URL is not set. */
export async function notifyDiscord(content: string) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.slice(0, 1900), allowed_mentions: { parse: [] } }),
    });
  } catch (err) {
    console.error("Discord notification failed", err);
  }
}

/** Where new briefs and new client messages are emailed. ADMIN_EMAIL overrides the default (contact@timy.studio). */
export function adminEmail() {
  return process.env.ADMIN_EMAIL || site.email;
}

/** Sends an email through Resend. Does nothing if RESEND_API_KEY / MAIL_FROM are not set. */
export async function sendEmail(to: string, subject: string, text: string, replyTo?: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!key || !from || !to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!res.ok) console.error("Resend error", res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error("Email failed", err);
    return false;
  }
}

export function orderLink(token: string) {
  return `${siteUrl()}/order/${token}`;
}

export function adminOrderLink(id: string) {
  return `${siteUrl()}/admin/orders/${id}`;
}
