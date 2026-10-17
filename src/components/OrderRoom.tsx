"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { site } from "@/lib/config";
import { formatDate, formatMoney, formatSize } from "@/lib/format";
import { uploadInChunks } from "@/lib/upload-client";
import { statusFlow, statusLabels, type OrderState } from "@/lib/types";
import { Chat } from "./Chat";
import { Icon } from "./Icon";
import { usePolling } from "./usePolling";

interface Props {
  token: string;
  initial: OrderState;
  justPaid: boolean;
  signedIn: boolean;
}

export function OrderRoom({ token, initial, justPaid, signedIn }: Props) {
  const [state, setState] = useState<OrderState>(initial);
  const [accept, setAccept] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const { order, messages, attachments } = state;

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${token}`, { cache: "no-store" });
      if (res.ok) setState((await res.json()) as OrderState);
    } catch {
      // keep the current view, try again on the next tick
    }
  }, [token]);

  // After Stripe redirects back, the confirmation can take a few seconds to arrive.
  const waitingForPayment = justPaid && order.status === "quoted";
  usePolling(refresh, waitingForPayment ? 2000 : 6000);

  async function send(body: string) {
    const res = await fetch(`/api/orders/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      return data.error ?? "Could not send your message.";
    }
    await refresh();
    return null;
  }

  async function attach(file: File, onProgress: (f: number) => void) {
    try {
      await uploadInChunks(
        file,
        { url: `/api/orders/${token}/files`, body: { chat: true } },
        (id) => `/api/upload/order/${token}/${id}`,
        onProgress,
      );
      await refresh();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : "Could not send the file.";
    }
  }

  async function pay() {
    setPaying(true);
    setPayError("");
    try {
      const res = await fetch(`/api/orders/${token}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setPayError(data.error ?? "Could not start the payment.");
        setPaying(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setPayError("Network problem. Please try again.");
      setPaying(false);
    }
  }

  const currentIndex = statusFlow.indexOf(order.status);
  const isPaid = order.status === "paid" || order.status === "in_production" || order.status === "delivered";

  return (
    <div className="wrap">
      <div className="page-head" style={{ paddingBottom: "1.5rem" }}>
        <h1 className="display" style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}>
          Hi {order.name.split(" ")[0]}, this is your project.
        </h1>
        <p className="lede">
          {order.project_type} · sent {formatDate(order.created_at)}.{" "}
          {signedIn ? (
            <>
              All your projects are in <Link href="/account" className="link-inline">your account</Link>.
            </>
          ) : (
            <>
              To find it again easily,{" "}
              <Link href={`/login?next=/order/${token}`} className="link-inline">
                create an account
              </Link>{" "}
              with the email you used for this brief: the project is added to it automatically and only you can open it.
            </>
          )}
        </p>
      </div>

      {order.status === "cancelled" ? (
        <p className="notice" style={{ marginBottom: "2.5rem" }}>
          This project was cancelled.
        </p>
      ) : (
        <ol className="timeline" aria-label="Project progress">
          {statusFlow.map((s, i) => (
            <li
              key={s}
              className={i < currentIndex ? "is-done" : i === currentIndex ? "is-current" : undefined}
              aria-current={i === currentIndex ? "step" : undefined}
            >
              {statusLabels[s]}
            </li>
          ))}
        </ol>
      )}

      <div className="room">
        <Chat messages={messages} me="client" onSend={send} onAttach={attach} placeholder="Ask a question or add details" />

        <aside className="room__side">
          {order.status === "quoted" && order.quote_amount ? (
            <section className="panel panel--accent" aria-labelledby="pay-title">
              <h2 id="pay-title">Final price</h2>
              <p className="price">{formatMoney(order.quote_amount, order.quote_currency)}</p>
              {order.quote_note ? <p className="muted" style={{ marginTop: "0.5rem" }}>{order.quote_note}</p> : null}
              {order.quote_breakdown?.length ? (
                <details className="breakdown-box">
                  <summary>How this price is worked out</summary>
                  <ul className="breakdown">
                    {order.quote_breakdown.map((l, i) => (
                      <li key={i}>
                        <span>{l.label}</span>
                        <span className="num">{formatMoney(l.amount, order.quote_currency)}</span>
                      </li>
                    ))}
                    <li className="breakdown__total">
                      <span>Total</span>
                      <span className="num">{formatMoney(order.quote_amount, order.quote_currency)}</span>
                    </li>
                  </ul>
                </details>
              ) : null}
              <label className="check" style={{ marginTop: "1.25rem" }}>
                <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} />
                <span>
                  I accept this price and the <Link href="/legal#terms" target="_blank">terms</Link>, and I ask for work to
                  start right after payment, within the withdrawal period.
                </span>
              </label>
              {payError ? (
                <p className="error" role="alert" style={{ marginTop: "0.75rem" }}>
                  {payError}
                </p>
              ) : null}
              <button
                className="btn btn--primary"
                style={{ marginTop: "1rem", width: "100%" }}
                onClick={pay}
                disabled={!accept || paying}
              >
                <Icon name="lock" /> {paying ? "Opening secure checkout…" : "Pay securely"}
              </button>
              <p className="hint" style={{ marginTop: "0.75rem" }}>
                Payment is handled by Stripe. Not right? Reply in the chat and I'll adjust.
              </p>
            </section>
          ) : isPaid ? (
            <section className="panel" aria-labelledby="pay-title">
              <h2 id="pay-title">Paid</h2>
              {order.quote_amount ? (
                <p className="price">{formatMoney(order.quote_amount, order.quote_currency)}</p>
              ) : null}
              <p className="muted" style={{ marginTop: "0.5rem" }}>
                {order.paid_at ? `Received ${formatDate(order.paid_at)}. ` : ""}Thank you. Stripe emails your receipt.
              </p>
            </section>
          ) : waitingForPayment ? null : order.status !== "cancelled" ? (
            <section className="panel" aria-labelledby="pay-title">
              <h2 id="pay-title">Price</h2>
              <p className="muted">
                No price yet. Once we've talked it through, I'll propose a final price here. You only pay after you've
                accepted it.
              </p>
            </section>
          ) : null}

          {waitingForPayment ? (
            <section className="panel" aria-live="polite">
              <h2>Confirming your payment…</h2>
              <p className="muted">This takes a few seconds. This page updates by itself.</p>
            </section>
          ) : null}

          <section className="panel" aria-labelledby="brief-title">
            <h2 id="brief-title">Your brief</h2>
            <dl className="facts">
              <div>
                <dt>Budget</dt>
                <dd>{order.budget}</dd>
              </div>
              {order.deadline ? (
                <div>
                  <dt>Deadline</dt>
                  <dd>{order.deadline}</dd>
                </div>
              ) : null}
              <div>
                <dt>Description</dt>
                <dd>{order.description}</dd>
              </div>
              {order.links ? (
                <div>
                  <dt>References</dt>
                  <dd>{order.links}</dd>
                </div>
              ) : null}
              {attachments.length > 0 ? (
                <div>
                  <dt>Files</dt>
                  <dd>
                    <ul className="attach">
                      {attachments.map((a) => (
                        <li key={a.id}>
                          {a.url ? (
                            <a
                              className="link-inline"
                              href={a.url}
                              style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                            >
                              {a.sender === "admin" ? "From timy.: " : ""}
                              {a.filename}
                            </a>
                          ) : (
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.filename}</span>
                          )}
                          <span className="muted num">{formatSize(a.size)}</span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="panel">
            <h2>Prefer another channel?</h2>
            <p className="muted">
              Write to <a className="link-inline" href={`mailto:${site.email}`}>{site.email}</a> or message @{site.handle} on
              Instagram or TikTok. Mention your project and I'll connect it.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
