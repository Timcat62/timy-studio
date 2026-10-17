/**
 * The price estimator in the admin order page. Every rate is here, in euros: change them to match how you work.
 * The client sees the resulting lines under the final price, so the labels are written for them.
 */

export interface EstimateInput {
  output: "video" | "stills";
  /** video length, in seconds */
  seconds: number;
  /** number of camera shots in the video, or of images for stills */
  shots: number;
  /** 0 = model ready to use, 1 = needs clean-up and materials, 2 = built from scratch */
  car: 0 | 1 | 2;
  /** 1 (plain studio) to 5 (full detailed world) */
  scene: number;
  /** 1 (camera moves only) to 5 (simulations: smoke, water, debris, crowds) */
  effects: number;
  revisions: number;
  formats: number;
  /** 0 = normal, 1 = fast, 2 = urgent */
  rush: 0 | 1 | 2;
}

export const defaultEstimate: EstimateInput = {
  output: "video",
  seconds: 15,
  shots: 4,
  car: 0,
  scene: 2,
  effects: 2,
  revisions: 2,
  formats: 1,
  rush: 0,
};

const RATES = {
  setup: 60, // brief, references, project setup
  perSecond: 9, // animation and render time, per second of video, before the effects factor
  perShot: 25, // camera, framing and lighting of each video shot
  perStill: 45, // each finished image
  car: [0, 90, 380], // ready / clean-up / built from scratch
  scene: [0, 40, 110, 200, 320], // 1 to 5
  effectsFactor: [1, 1.15, 1.35, 1.6, 2], // multiplies the render line, 1 to 5
  effectsWork: [0, 0, 60, 150, 280], // simulation set-up, 1 to 5
  perRevision: 35, // each round after the first
  perFormat: 30, // each extra format (vertical, horizontal, square…)
  rush: [0, 0.25, 0.5], // share added to the total
};

export const carLabels = ["Ready to use", "Needs clean-up", "Built from scratch"];
export const sceneLabels = ["Plain studio", "Simple set", "Detailed set", "Large environment", "Full detailed world"];
export const effectsLabels = ["Camera moves only", "Light motion", "Some effects", "Heavy effects", "Full simulations"];
export const rushLabels = ["Normal", "Fast (+25%)", "Urgent (+50%)"];

export interface EstimateLine {
  label: string;
  /** cents */
  amount: number;
}

const euros = (n: number) => Math.round(n) * 100;

/** Lines of the estimate, in cents. The total is rounded to the nearest 5 €, with the rounding in the last line. */
export function estimate(i: EstimateInput): EstimateLine[] {
  const lines: EstimateLine[] = [{ label: "Brief, references and project setup", amount: euros(RATES.setup) }];
  const fx = RATES.effectsFactor[i.effects - 1] ?? 1;

  if (i.output === "video") {
    lines.push({ label: `Animation and render, ${i.seconds} s`, amount: euros(i.seconds * RATES.perSecond * fx) });
    lines.push({ label: `Camera and lighting, ${i.shots} shot${i.shots > 1 ? "s" : ""}`, amount: euros(i.shots * RATES.perShot) });
  } else {
    lines.push({ label: `${i.shots} finished image${i.shots > 1 ? "s" : ""}`, amount: euros(i.shots * RATES.perStill * fx) });
  }
  if (RATES.car[i.car]) lines.push({ label: `Car model: ${carLabels[i.car].toLowerCase()}`, amount: euros(RATES.car[i.car]) });
  const scene = RATES.scene[i.scene - 1] ?? 0;
  if (scene) lines.push({ label: `Scene: ${sceneLabels[i.scene - 1].toLowerCase()}`, amount: euros(scene) });
  const fxWork = RATES.effectsWork[i.effects - 1] ?? 0;
  if (fxWork) lines.push({ label: `Effects: ${effectsLabels[i.effects - 1].toLowerCase()}`, amount: euros(fxWork) });
  if (i.revisions > 1) {
    lines.push({ label: `${i.revisions - 1} extra revision round${i.revisions > 2 ? "s" : ""}`, amount: euros((i.revisions - 1) * RATES.perRevision) });
  }
  if (i.formats > 1) {
    lines.push({ label: `${i.formats - 1} extra format${i.formats > 2 ? "s" : ""}`, amount: euros((i.formats - 1) * RATES.perFormat) });
  }
  const subtotal = lines.reduce((n, l) => n + l.amount, 0);
  if (i.rush) lines.push({ label: `${rushLabels[i.rush].replace(/ \(.*/, "")} delivery`, amount: Math.round(subtotal * RATES.rush[i.rush]) });

  const total = lines.reduce((n, l) => n + l.amount, 0);
  const rounded = Math.round(total / 500) * 500;
  if (rounded !== total) lines[lines.length - 1].amount += rounded - total;
  return lines;
}
