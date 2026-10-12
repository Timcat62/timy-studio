"use client";

import { useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/format";
import type { Message } from "@/lib/types";
import { Icon } from "./Icon";

interface Props {
  messages: Message[];
  /** Who is looking at the chat: their own messages sit on the right. */
  me: "client" | "admin";
  /** Resolves to an error message, or null when sent. */
  onSend: (body: string) => Promise<string | null>;
  placeholder?: string;
}

export function Chat({ messages, me, onSend, placeholder }: Props) {
  const log = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const el = log.current;
    if (el && messages.length !== lastCount.current) {
      el.scrollTo({ top: el.scrollHeight });
      lastCount.current = messages.length;
    }
  }, [messages]);

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError("");
    const err = await onSend(body);
    setSending(false);
    if (err) setError(err);
    else setDraft("");
  }

  return (
    <div className="chat">
      <div className="chat__log" ref={log} role="log" aria-live="polite" aria-label="Conversation">
        {messages.length === 0 ? <p className="chat__empty">No messages yet.</p> : null}
        {messages.map((m) => {
          const cls = m.sender === "system" ? "msg msg--system" : m.sender === me ? "msg msg--me" : "msg msg--them";
          return (
            <div key={m.id} className={cls}>
              <div className="msg__body">{m.body}</div>
              {m.sender !== "system" ? (
                <div className="msg__meta" suppressHydrationWarning>
                  {m.sender === "admin" && me === "client" ? "timy. · " : ""}
                  {formatTime(m.created_at)}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <form
        className="chat__form"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <label className="sr-only" htmlFor={`chat-${me}`}>
          Your message
        </label>
        <textarea
          id={`chat-${me}`}
          className="textarea"
          value={draft}
          maxLength={4000}
          placeholder={placeholder ?? "Write a message"}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void send();
            }
          }}
        />
        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="chat__send">
          <span className="hint">Ctrl + Enter to send</span>
          <button className="btn btn--primary btn--small" type="submit" disabled={sending || !draft.trim()}>
            Send <Icon name="send" />
          </button>
        </div>
      </form>
    </div>
  );
}
