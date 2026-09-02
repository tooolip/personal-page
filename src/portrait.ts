import { randomSeed, roughEllipse, variants } from "drawably";
import { BOIL } from "./motion.ts";

const SVG_NS = "http://www.w3.org/2000/svg";

// The oval's own coordinate space. The SVG scales via viewBox, so these stay
// fixed no matter how wide the figure renders.
const W = 260;
const H = 330;
const CX = W / 2;
const CY = H / 2;

// The photo is clipped a few px inside the pen ring, so the ring reads as a
// frame drawn around it rather than a line cutting across the edge.
const CLIP_RX = 114;
const CLIP_RY = 148;
const RING_RX = 118;
const RING_RY = 152;

function el<K extends keyof SVGElementTagNameMap>(
  name: K,
  attrs: Record<string, string>,
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

/**
 * Swap the plain <img> for a hand-drawn oval: the photo clipped to a rough
 * ellipse, with a boiling pen ring drawn around it.
 *
 * The <img> is the no-JS fallback (CSS rounds it to a clean oval), so this
 * only ever upgrades what's already on the page.
 */
export function drawPortrait(figure: HTMLElement): void {
  const img = figure.querySelector("img");
  if (!img) return;

  const seed = randomSeed();
  const clipId = `portrait-clip-${seed}`;

  // drawably-svg carries the library's boil animation, which also gives us
  // its prefers-reduced-motion handling for free.
  const svg = el("svg", {
    class: "portrait-svg drawably-svg",
    viewBox: `0 0 ${W} ${H}`,
    role: "img",
    "aria-label": img.alt || "Portrait",
  });

  const defs = el("defs", {});
  const clip = el("clipPath", { id: clipId });
  clip.appendChild(
    el("path", { d: roughEllipse(CX, CY, CLIP_RX, CLIP_RY, { seed, roughness: 1 }) }),
  );
  defs.appendChild(clip);
  svg.appendChild(defs);

  const photo = el("image", {
    href: img.currentSrc || img.src,
    x: "0",
    y: "0",
    width: String(W),
    height: String(H),
    preserveAspectRatio: "xMidYMid slice",
    "clip-path": `url(#${clipId})`,
  });
  svg.appendChild(photo);

  // Three frames of the same ring, cycled by drawably's CSS.
  const frames = variants(
    (o) => roughEllipse(CX, CY, RING_RX, RING_RY, o),
    { seed, roughness: 1, boil: BOIL },
  );
  frames.forEach((d, i) => {
    svg.appendChild(
      el("path", { class: "drawably-boil", "data-i": String(i), d }),
    );
  });

  img.replaceWith(svg);
}
