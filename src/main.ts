import { drawablyDivider, drawablyList, drawablyUnderline } from "drawably";
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

sketch<HTMLElement>("#rule-1", (el) => drawablyDivider(el));
sketch<HTMLElement>("#work-list", (el) => drawablyList(el, { marker: "dash" }));

for (const el of document.querySelectorAll<HTMLElement>('[data-sketch="underline"]')) {
  try {
    drawablyUnderline(el);
  } catch (err) {
    console.warn("drawably: could not underline", err);
  }
}

const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());
