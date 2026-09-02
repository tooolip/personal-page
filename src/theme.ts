import { drawablyToggle } from "drawably";

const KEY = "theme";
type Theme = "light" | "dark";

/** Reading localStorage throws in some privacy modes; a theme is never worth a crash. */
function stored(): Theme | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

function remember(theme: Theme): void {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* ignore */
  }
}

/**
 * Wire the sketched toggle to the page theme.
 *
 * With no stored choice the page follows the system, so data-theme stays off
 * the root and the light-dark() palette resolves on its own. The first flip
 * pins it.
 */
export function initTheme(wrap: HTMLElement): void {
  const input = wrap.querySelector<HTMLInputElement>('input[type="checkbox"]');
  if (!input) return;

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const choice = stored();

  // Set the checkbox before drawably sketches it, so the first paint is right.
  input.checked = choice ? choice === "dark" : media.matches;
  if (choice) document.documentElement.dataset.theme = choice;

  drawablyToggle(wrap);

  input.addEventListener("change", () => {
    const theme: Theme = input.checked ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    remember(theme);
  });

  // Track the system only while the visitor hasn't made a choice.
  media.addEventListener("change", (e) => {
    if (stored()) return;
    input.checked = e.matches;
  });
}
