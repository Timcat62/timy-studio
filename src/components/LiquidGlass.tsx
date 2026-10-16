"use client";

import { useEffect } from "react";

/** Everything that is drawn as liquid glass. */
const SELECTOR = ".btn, .social, .site-header__row, .chapters__dots, .yt__icon, .work-card__play";
/** Glass that reacts to touch and pointer like a physical button (it grows, follows the finger, springs back). */
const TACTILE = ".btn, .social";

const NS = "http://www.w3.org/2000/svg";
/** How far red and blue drift apart at the edge (0 = no colour fringe, 0.2 = very strong). */
const DISPERSION = 0.3;

/**
 * Real refraction (the lens-like bending of whatever is behind the glass) needs SVG filters inside backdrop-filter,
 * which only Chromium browsers render. Everywhere else you get the blurred, translucent glass with the
 * specular rim, which already reads as glass.
 */
function canRefract() {
  const ua = navigator.userAgent;
  return /Chrome\//.test(ua) && !/(CriOS|FxiOS|OPiOS)/.test(ua) && CSS.supports("backdrop-filter", "blur(1px)");
}

/** A displacement map for a rounded rectangle: the edge ("bezel") bends the backdrop inward, the centre stays flat. */
function displacementMap(w: number, h: number, r: number, bezel: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(w, h);
  const px = img.data;
  const hw = w / 2;
  const hh = h / 2;
  const ix = hw - r;
  const iy = hh - r;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x + 0.5 - hw;
      const dy = y + 0.5 - hh;
      const qx = Math.abs(dx) - ix;
      const qy = Math.abs(dy) - iy;
      let nx = 0;
      let ny = 0;
      let dist: number;
      if (qx > 0 && qy > 0) {
        const l = Math.hypot(qx, qy);
        nx = (Math.sign(dx) * qx) / l;
        ny = (Math.sign(dy) * qy) / l;
        dist = l - r;
      } else if (qx > qy) {
        nx = Math.sign(dx);
        dist = qx - r;
      } else {
        ny = Math.sign(dy);
        dist = qy - r;
      }
      const depth = -dist;
      const t = depth >= bezel ? 1 : Math.max(0, depth) / bezel;
      const m = Math.pow(1 - t, 2.2); // strongest right at the edge, gone toward the centre
      const i = (y * w + x) * 4;
      px[i] = 128 + -nx * m * 127;
      px[i + 1] = 128 + -ny * m * 127;
      px[i + 2] = 128;
      px[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png");
}

export function LiquidGlass() {
  useEffect(() => {
    /* ---------- 1. Pointer and touch: highlight, stretch, press ---------- */
    let frame = 0;
    let pressed: HTMLElement | null = null;

    const place = (el: HTMLElement, clientX: number, clientY: number, tactile: boolean) => {
      const r = el.getBoundingClientRect();
      const px = (clientX - r.left) / r.width;
      const py = (clientY - r.top) / r.height;
      el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
      // rim light turns to face the pointer
      const angle = (Math.atan2(py - 0.5, px - 0.5) * 180) / Math.PI + 90;
      el.style.setProperty("--ang", `${angle.toFixed(0)}deg`);
      if (tactile) {
        el.style.setProperty("--tx", `${((px - 0.5) * 7).toFixed(2)}px`);
        el.style.setProperty("--ty", `${((py - 0.5) * 5).toFixed(2)}px`);
      }
    };

    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(SELECTOR) as HTMLElement | null;
      if (!el) return;
      const { clientX, clientY } = e;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => place(el, clientX, clientY, el.matches(TACTILE)));
    };
    const onLeave = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(TACTILE) as HTMLElement | null;
      if (!el || el.contains(e.relatedTarget as Node | null)) return;
      el.style.setProperty("--tx", "0px");
      el.style.setProperty("--ty", "0px");
    };
    const onDown = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(TACTILE) as HTMLElement | null;
      if (!el) return;
      pressed = el;
      place(el, e.clientX, e.clientY, true);
      el.classList.add("is-pressed");
    };
    const onUp = () => {
      if (pressed) {
        pressed.classList.remove("is-pressed");
        pressed.style.setProperty("--tx", "0px");
        pressed.style.setProperty("--ty", "0px");
        pressed = null;
      }
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onLeave, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });

    /* ---------- 2. Refraction (Chromium only) ---------- */
    let teardown = () => {};
    if (canRefract()) {
      document.documentElement.classList.add("lg-refract");
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("width", "0");
      svg.setAttribute("height", "0");
      svg.setAttribute("aria-hidden", "true");
      svg.style.cssText = "position:absolute;pointer-events:none;width:0;height:0";
      const defs = document.createElementNS(NS, "defs");
      svg.appendChild(defs);
      document.body.appendChild(svg);

      const filters = new Map<string, string>();
      let counter = 0;

      const filterFor = (w: number, h: number, r: number) => {
        const key = `${w}x${h}x${r}`;
        const known = filters.get(key);
        if (known) return known;
        const id = `lg${counter++}`;
        const bezel = Math.max(6, Math.min(r, h / 2) * 0.62);
        const url = displacementMap(w, h, r, bezel);
        const f = document.createElementNS(NS, "filter");
        f.setAttribute("id", id);
        f.setAttribute("filterUnits", "userSpaceOnUse");
        f.setAttribute("x", "0");
        f.setAttribute("y", "0");
        f.setAttribute("width", String(w));
        f.setAttribute("height", String(h));
        f.setAttribute("color-interpolation-filters", "sRGB");
        const img = document.createElementNS(NS, "feImage");
        img.setAttribute("href", url);
        img.setAttribute("x", "0");
        img.setAttribute("y", "0");
        img.setAttribute("width", String(w));
        img.setAttribute("height", String(h));
        img.setAttribute("preserveAspectRatio", "none");
        img.setAttribute("result", "map");
        f.appendChild(img);
        // Chromatic dispersion: each colour channel is bent by a slightly different amount, like light through a
        // real lens. The map is neutral in the centre, so the colour fringes only show up along the edge.
        const scale = bezel * 2.4;
        const channels = [
          { name: "r", k: 1 + DISPERSION, matrix: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" },
          { name: "g", k: 1, matrix: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" },
          { name: "b", k: 1 - DISPERSION, matrix: "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" },
        ];
        for (const c of channels) {
          const disp = document.createElementNS(NS, "feDisplacementMap");
          disp.setAttribute("in", "SourceGraphic");
          disp.setAttribute("in2", "map");
          disp.setAttribute("scale", (scale * c.k).toFixed(1));
          disp.setAttribute("xChannelSelector", "R");
          disp.setAttribute("yChannelSelector", "G");
          disp.setAttribute("result", `d${c.name}`);
          const only = document.createElementNS(NS, "feColorMatrix");
          only.setAttribute("in", `d${c.name}`);
          only.setAttribute("type", "matrix");
          only.setAttribute("values", c.matrix);
          only.setAttribute("result", c.name);
          f.append(disp, only);
        }
        // screen-blending three single-channel images adds them back into one full-colour image
        const rg = document.createElementNS(NS, "feBlend");
        rg.setAttribute("in", "r");
        rg.setAttribute("in2", "g");
        rg.setAttribute("mode", "screen");
        rg.setAttribute("result", "rg");
        const rgb = document.createElementNS(NS, "feBlend");
        rgb.setAttribute("in", "rg");
        rgb.setAttribute("in2", "b");
        rgb.setAttribute("mode", "screen");
        f.append(rg, rgb);
        defs.appendChild(f);
        filters.set(key, id);
        return id;
      };

      const apply = (el: HTMLElement) => {
        const box = el.getBoundingClientRect();
        // use layout size, not the scaled size, so hover and press animations do not rebuild the filter
        const w = Math.round(el.offsetWidth || box.width);
        const h = Math.round(el.offsetHeight || box.height);
        if (w < 8 || h < 8) return;
        const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
        const r = Math.min(radius, h / 2, w / 2) || Math.min(h, w) / 2;
        const id = filterFor(w, h, Math.round(r));
        const value = `url(#${id}) saturate(1.35)`;
        el.style.setProperty("backdrop-filter", value);
        el.style.setProperty("-webkit-backdrop-filter", value);
      };

      const seen = new WeakSet<Element>();
      const ro = new ResizeObserver((entries) => entries.forEach((en) => apply(en.target as HTMLElement)));
      const scan = () => {
        document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
          if (seen.has(el)) return;
          seen.add(el);
          apply(el);
          ro.observe(el);
        });
      };
      scan();
      let scanFrame = 0;
      const mo = new MutationObserver(() => {
        cancelAnimationFrame(scanFrame);
        scanFrame = requestAnimationFrame(scan);
      });
      mo.observe(document.body, { childList: true, subtree: true });

      teardown = () => {
        mo.disconnect();
        ro.disconnect();
        svg.remove();
        document.documentElement.classList.remove("lg-refract");
      };
    }

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onLeave);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      teardown();
    };
  }, []);

  return null;
}
