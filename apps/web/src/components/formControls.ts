import { clsx } from "clsx";

export const COMMON_STYLES_BASE = clsx(
  "rounded px-3 py-2 focus:border-primary focus:outline-none [border:2px_solid_#ccc]",
  "[transition:border-color_ease-in-out_0.15s]",
);
/** Champs sur une ligne (input, select) : hauteur fixe, indépendante du contexte. */
export const COMMON_STYLES = clsx(COMMON_STYLES_BASE, "w-full", "h-11");
/** Zone de texte multiligne : hauteur libre. */
export const TEXTAREA_STYLES = clsx(COMMON_STYLES_BASE, "w-full");
