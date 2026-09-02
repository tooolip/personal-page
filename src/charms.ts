import {
  randomSeed,
  roughCircle,
  roughLine,
  roughRoundedRect,
  variants,
} from "drawably";
import type { RoughOptions } from "drawably";
import { BOIL } from "./motion.ts";
import { el } from "./svg.ts";

const BOX = 48;

/** Shift the seed per stroke, or repeated shapes wobble in lockstep. */
const nth = (o: RoughOptions, n: number): RoughOptions => ({
  ...o,
  seed: o.seed + n * 131,
});

type Draw = (o: RoughOptions) => string;

/**
 * One doodle per destination, composed from drawably's rough primitives so
 * they're drawn in the same pen as everything else. Kept to plain shapes
 * rather than brand marks -- a wobbly logo just looks like a bad logo.
 */
const CHARMS: Record<string, Draw> = {
  // a wall of blocks
  arena: (o) =>
    roughRoundedRect(9, 9, 13, 13, 2, nth(o, 0)) +
    roughRoundedRect(26, 9, 13, 13, 2, nth(o, 1)) +
    roughRoundedRect(9, 26, 13, 13, 2, nth(o, 2)) +
    roughRoundedRect(26, 26, 13, 13, 2, nth(o, 3)),

  // the letter itself
  x: (o) => roughLine(13, 13, 35, 35, nth(o, 0)) + roughLine(35, 13, 13, 35, nth(o, 1)),

  // a commit graph with one branch off it
  github: (o) =>
    roughLine(15, 11, 15, 37, nth(o, 0)) +
    roughCircle(15, 12.5, 4, nth(o, 1)) +
    roughCircle(15, 35.5, 4, nth(o, 2)) +
    roughLine(15, 23, 31, 31, nth(o, 3)) +
    roughCircle(33.5, 32, 4, nth(o, 4)),

  // an open book
  storygraph: (o) =>
    roughRoundedRect(10, 13, 28, 23, 2, nth(o, 0)) +
    roughLine(24, 13, 24, 36, nth(o, 1)) +
    roughLine(14, 20, 20, 20, nth(o, 2)) +
    roughLine(28, 20, 34, 20, nth(o, 3)),

  // three dots in a row
  letterboxd: (o) =>
    roughCircle(12.5, 24, 5.6, nth(o, 0)) +
    roughCircle(24, 24, 5.6, nth(o, 1)) +
    roughCircle(35.5, 24, 5.6, nth(o, 2)),

  // a controller: d-pad on the left, buttons on the right
  backloggd: (o) =>
    roughRoundedRect(6, 15, 36, 19, 7, nth(o, 0)) +
    roughLine(13, 24.5, 21, 24.5, nth(o, 1)) +
    roughLine(17, 20.5, 17, 28.5, nth(o, 2)) +
    roughCircle(30, 21.5, 2.8, nth(o, 3)) +
    roughCircle(35.5, 27, 2.8, nth(o, 4)),
};

function drawCharm(mount: HTMLElement, draw: Draw): void {
  const seed = randomSeed();
  const svg = el("svg", {
    class: "charm-svg drawably-svg",
    viewBox: `0 0 ${BOX} ${BOX}`,
    "aria-hidden": "true",
  });
  variants(draw, { seed, roughness: 0.75, boil: BOIL }).forEach((d, i) => {
    svg.appendChild(el("path", { class: "drawably-boil", "data-i": String(i), d }));
  });
  mount.replaceChildren(svg);
}

/**
 * Draw each charm and scatter it. Positions come from CSS so the layout still
 * holds without JS; this only adds the per-load tilt and nudge that keep the
 * arrangement from looking placed on a grid.
 */
export function renderCharms(root: HTMLElement): void {
  for (const anchor of root.querySelectorAll<HTMLElement>(".charm")) {
    const key = anchor.dataset.charm;
    const draw = key ? CHARMS[key] : undefined;
    const art = anchor.querySelector<HTMLElement>(".charm-art");
    if (!draw || !art) continue;

    // Kept modest: tilt widens the label's bounding box, and the two together
    // pushed the widest label off the left edge on a phone.
    anchor.style.setProperty("--rot", `${(Math.random() * 2 - 1) * 10}deg`);
    anchor.style.setProperty("--dx", `${(Math.random() * 2 - 1) * 9}px`);
    anchor.style.setProperty("--dy", `${(Math.random() * 2 - 1) * 11}px`);

    try {
      drawCharm(art, draw);
    } catch (err) {
      console.warn(`drawably: could not draw charm ${key}`, err);
    }
  }
}
