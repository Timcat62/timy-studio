"use client";

import { useMemo, useState } from "react";
import {
  carLabels,
  defaultEstimate,
  effectsLabels,
  estimate,
  rushLabels,
  sceneLabels,
  type EstimateInput,
  type EstimateLine,
} from "@/lib/estimate";
import { formatMoney } from "@/lib/format";

function Slider(props: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  shown: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="estimator__row">
      <label className="label" htmlFor={props.id}>
        {props.label} <span className="estimator__value">{props.shown}</span>
      </label>
      <input
        id={props.id}
        type="range"
        className="range"
        min={props.min}
        max={props.max}
        step={props.step ?? 1}
        value={props.value}
        style={{ "--fill": `${((props.value - props.min) / (props.max - props.min)) * 100}%` } as React.CSSProperties}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </div>
  );
}

/** Sliders that work out a price from the project, line by line. "Use this price" fills the price form. */
export function PriceEstimator({ onUse }: { onUse: (lines: EstimateLine[], total: number) => void }) {
  const [v, setV] = useState<EstimateInput>(defaultEstimate);
  const set = <K extends keyof EstimateInput>(k: K, value: EstimateInput[K]) => setV((s) => ({ ...s, [k]: value }));
  const lines = useMemo(() => estimate(v), [v]);
  const total = lines.reduce((n, l) => n + l.amount, 0);
  const video = v.output === "video";

  return (
    <div className="estimator">
      <div className="segmented" role="group" aria-label="Output">
        {(["video", "stills"] as const).map((o) => (
          <button key={o} type="button" aria-pressed={v.output === o} onClick={() => set("output", o)}>
            {o === "video" ? "Video" : "Stills"}
          </button>
        ))}
      </div>
      {video ? (
        <Slider id="e-sec" label="Length" value={v.seconds} min={5} max={120} step={5} shown={`${v.seconds} s`} onChange={(n) => set("seconds", n)} />
      ) : null}
      <Slider
        id="e-shots"
        label={video ? "Shots" : "Images"}
        value={v.shots}
        min={1}
        max={video ? 20 : 15}
        shown={String(v.shots)}
        onChange={(n) => set("shots", n)}
      />
      <Slider id="e-car" label="Car model" value={v.car} min={0} max={2} shown={carLabels[v.car]} onChange={(n) => set("car", n as 0 | 1 | 2)} />
      <Slider id="e-scene" label="Scene" value={v.scene} min={1} max={5} shown={sceneLabels[v.scene - 1]} onChange={(n) => set("scene", n)} />
      <Slider id="e-fx" label="Effects" value={v.effects} min={1} max={5} shown={effectsLabels[v.effects - 1]} onChange={(n) => set("effects", n)} />
      <Slider id="e-rev" label="Revision rounds" value={v.revisions} min={1} max={5} shown={String(v.revisions)} onChange={(n) => set("revisions", n)} />
      <Slider id="e-fmt" label="Formats" value={v.formats} min={1} max={4} shown={String(v.formats)} onChange={(n) => set("formats", n)} />
      <Slider id="e-rush" label="Deadline" value={v.rush} min={0} max={2} shown={rushLabels[v.rush]} onChange={(n) => set("rush", n as 0 | 1 | 2)} />

      <ul className="breakdown">
        {lines.map((l) => (
          <li key={l.label}>
            <span>{l.label}</span>
            <span className="num">{formatMoney(l.amount, "eur")}</span>
          </li>
        ))}
        <li className="breakdown__total">
          <span>Total</span>
          <span className="num">{formatMoney(total, "eur")}</span>
        </li>
      </ul>
      <button type="button" className="btn btn--ghost btn--small" onClick={() => onUse(lines, total)}>
        Use this price
      </button>
    </div>
  );
}
