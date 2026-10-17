"use client";

import { useState } from "react";

/** Questions that open and close smoothly (the answer's height is animated in CSS). */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<Set<number>>(new Set());

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="faq">
      {items.map((item, i) => {
        const isOpen = open.has(i);
        return (
          <div key={item.q} className="faq__item" data-open={isOpen}>
            <h3 className="faq__q">
              <button type="button" id={`faq-q-${i}`} aria-expanded={isOpen} aria-controls={`faq-a-${i}`} onClick={() => toggle(i)}>
                {item.q}
              </button>
            </h3>
            <div className="faq__panel" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
              <div className="faq__inner" inert={!isOpen}>
                <p className="faq__answer">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
