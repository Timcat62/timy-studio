"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { formatDate, formatMoney, formatSize } from "@/lib/format";
import { uploadInChunks } from "@/lib/upload-client";
import { statusLabels, type AdminOrderState, type OrderStatus } from "@/lib/types";
import { Chat } from "./Chat";
import { usePolling } from "./usePolling";

export function AdminOrder({ id, initial }: { id: string; initial: AdminOrderState }) {
  const [state, setState] = useState(initial);
  const { order, messages, attachments } = state;

  const [amount, setAmount] = useState(order.quote_amount ? String(order.quote_amount / 100) : "");
  const [note, setNote] = useState(order.quote_note ?? "");
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { cache: "no-store" });
      if (res.ok) {
        const next = (await res.json()) as AdminOrderState;
        setState(next);
        setStatus((s) => (s === state.order.status ? next.order.status : s));
      }
    } catch {
      // try again on the next tick
    }
  }, [id, state.order.status]);

  usePolling(refresh, 5000);

  async function act(payload: Record<string, unknown>): Promise<string | null> {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      return data.error ?? "Something went wrong.";
    }
    const fresh = await fetch(`/api/admin/orders/${id}`, { cache: "no-store" });
    if (fresh.ok) {
      const next = (await fresh.json()) as AdminOrderState;
      setState(next);
      setStatus(next.order.status);
    }
    return null;
  }

  async function attach(file: File, onProgress: (f: number) => void) {
    try {
      await uploadInChunks(file, { url: `/api/admin/orders/${id}/files` }, (fileId) => `/api/upload/admin-order/${id}/${fileId}`, onProgress);
      await refresh();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : "Could not send the file.";
    }
  }

  async function sendQuote(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount.replace(",", "."));
    if (!Number.isFinite(value) || value < 1) {
      setNotice("Enter an amount in euros.");
      return;
    }
    setBusy(true);
    const err = await act({ action: "quote", amount: value, note });
    setNotice(err ?? "Price sent. The client can now pay from their page.");
    setBusy(false);
  }

  async function changeStatus() {
    setBusy(true);
    const err = await act({ action: "status", status });
    setNotice(err ?? "Status updated.");
    setBusy(false);
  }

  const locked = order.status === "paid" || order.status === "in_production" || order.status === "delivered";

  return (
    <div className="room">
      <div className="stack">
        <Chat
          messages={messages}
          me="admin"
          onSend={(body) => act({ action: "message", body })}
          onAttach={attach}
          placeholder="Reply to the client"
        />
      </div>

      <aside className="room__side">
        <section className="panel">
          <h2>{order.name}</h2>
          <dl className="facts">
            <div>
              <dt>Email</dt>
              <dd>
                <a className="link-inline" href={`mailto:${order.email}`}>
                  {order.email}
                </a>
              </dd>
            </div>
            <div>
              <dt>Project</dt>
              <dd>
                {order.project_type}, budget {order.budget}
                {order.deadline ? `, deadline ${order.deadline}` : ""}
              </dd>
            </div>
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
            <div>
              <dt>Received</dt>
              <dd suppressHydrationWarning>{formatDate(order.created_at)}</dd>
            </div>
          </dl>
          <p style={{ marginTop: "1rem" }}>
            <Link className="link-inline" href={`/order/${order.token}`} target="_blank">
              Open the client's view
            </Link>
          </p>
        </section>

        <section className="panel">
          <h2>Files</h2>
          {attachments.length === 0 ? (
            <p className="muted">No files attached.</p>
          ) : (
            <ul className="attach">
              {attachments.map((a) => (
                <li key={a.id}>
                  {a.url ? (
                    <a href={a.url}>
                      {a.sender === "admin" ? "Sent by me: " : ""}
                      {a.filename}
                    </a>
                  ) : (
                    <span>{a.filename}</span>
                  )}
                  <span className="muted num">{formatSize(a.size)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <h2>Final price</h2>
          {locked ? (
            <p>
              Paid{order.quote_amount ? `: ${formatMoney(order.quote_amount, order.quote_currency)}` : ""}.
            </p>
          ) : (
            <form className="stack" onSubmit={sendQuote}>
              {order.status === "quoted" && order.quote_amount ? (
                <p className="muted">
                  Current price sent: {formatMoney(order.quote_amount, order.quote_currency)}. Sending a new one replaces it.
                </p>
              ) : (
                <p className="muted">The client can only pay after you send a price here.</p>
              )}
              <div className="field">
                <label className="label" htmlFor="amount">
                  Amount (EUR)
                </label>
                <input
                  id="amount"
                  className="input num"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="450"
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="note">
                  What it covers <span className="muted">(optional)</span>
                </label>
                <input
                  id="note"
                  className="input"
                  value={note}
                  maxLength={500}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="One 20 s vertical film, two revisions"
                />
              </div>
              <div>
                <button className="btn btn--primary" type="submit" disabled={busy || !amount}>
                  Send price to client
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="panel">
          <h2>Status</h2>
          <div className="stack">
            <div className="field">
              <label className="label sr-only" htmlFor="status">
                Status
              </label>
              <select className="select" id="status" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
                {(Object.keys(statusLabels) as OrderStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </select>
              <p className="hint">
                Choose "Paid" to record a payment made outside the site (bank transfer, PayPal).
              </p>
            </div>
            <div>
              <button className="btn btn--ghost btn--small" onClick={changeStatus} disabled={busy || status === order.status}>
                Update status
              </button>
            </div>
          </div>
        </section>

        {notice ? (
          <p className="notice" role="status">
            {notice}
          </p>
        ) : null}
      </aside>
    </div>
  );
}
