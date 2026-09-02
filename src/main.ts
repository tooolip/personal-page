import { drawablyDivider, drawablyList } from "drawably";
import { drawPortrait } from "./portrait.ts";
import { initTheme } from "./theme.ts";
import { BOIL } from "./motion.ts";
import "drawably/style.css";
import "drawably/font.css";

/**
 * Attach a drawably sketch to one element, if it's there.
 * The attachers throw on a missing element, and a decorative sketch
 * failing should never take the page down with it.
 */
function sketch<T extends Element>(
  selector: string,
  attach: (el: T) => unknown,
): void {
  const el = document.querySelector<T>(selector);
  if (!el) return;
  try {
    attach(el);
  } catch (err) {
    console.warn(`drawably: could not sketch ${selector}`, err);
  }
}

sketch<HTMLElement>(".theme-toggle-track", initTheme);
sketch<HTMLElement>(".portrait", drawPortrait);
sketch<HTMLElement>("#rule-1", (el) => drawablyDivider(el, { boil: BOIL }));
sketch<HTMLElement>("#link-list", (el) => drawablyList(el, { marker: "dash", boil: BOIL }));


const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());
