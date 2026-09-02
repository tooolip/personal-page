import { randomSeed, roughCircle, roughLine, variants } from "drawably";
import type { RoughOptions } from "drawably";
import { BOIL } from "./motion.ts";

const SVG_NS = "http://www.w3.org/2000/svg";
const BOX = 24;

function el<K extends keyof SVGElementTagNameMap>(
  name: K,
  attrs: Record<string, string>,
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

/** A disc with eight rays. Each ray gets its own seed so they don't repeat. */
function sunPath(o: RoughOptions): string {
  let d = roughCircle(12, 12, 4.5, o);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const [cos, sin] = [Math.cos(a), Math.sin(a)];
    d += roughLine(
      12 + cos * 7,
      12 + sin * 7,
      12 + cos * 10.5,
      12 + sin * 10.5,
      { ...o, seed: o.seed + i * 131 },
    );
  }
  return d;
}

/** The moon is a filled disc; a mask bites the crescent out of it. */
function moonDisc(o: RoughOptions): string {
  return roughCircle(12, 12, 7.5, o);
}

function moonBite(o: RoughOptions): string {
  return roughCircle(16.5, 8, 7, { ...o, seed: o.seed + 977 });
}

function shell(label: string): SVGSVGElement {
  // drawably-svg carries the boil animation and its reduced-motion handling.
  return el("svg", {
    class: `theme-icon theme-icon-${label} drawably-svg`,
    viewBox: `0 0 ${BOX} ${BOX}`,
    "aria-hidden": "true",
  });
}

function boiled(gen: (o: RoughOptions) => string, seed: number): string[] {
  return variants(gen, { seed, roughness: 0.7, boil: BOIL });
}

export function renderSun(mount: HTMLElement): void {
  const seed = randomSeed();
  const svg = shell("sun");
  boiled(sunPath, seed).forEach((d, i) => {
    svg.appendChild(el("path", { class: "drawably-boil", "data-i": String(i), d }));
  });
  mount.replaceChildren(svg);
}

export function renderMoon(mount: HTMLElement): void {
  const seed = randomSeed();
  const svg = shell("moon");
  const maskId = `moon-mask-${seed}`;

  // White keeps, black cuts. A static bite against a boiling disc reads fine
  // at this size and saves two extra masks.
  const mask = el("mask", { id: maskId });
  mask.appendChild(el("rect", { width: String(BOX), height: String(BOX), fill: "white" }));
  mask.appendChild(el("path", { d: moonBite({ seed, roughness: 0.7 }), fill: "black" }));
  svg.appendChild(mask);

  boiled(moonDisc, seed).forEach((d, i) => {
    svg.appendChild(
      el("path", {
        class: "drawably-boil moon-body",
        "data-i": String(i),
        d,
        mask: `url(#${maskId})`,
      }),
    );
  });
  mount.replaceChildren(svg);
}
