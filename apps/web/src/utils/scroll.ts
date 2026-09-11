import type { RefObject } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router";

const saveScrollPos = (path: string, elt: HTMLElement | null) => {
  if (!elt) return;
  sessionStorage.setItem(
    `scrollPos:${path}`,
    JSON.stringify({ top: elt.scrollTop }),
  );
};

const restoreScrollPos = (path: string, elt: HTMLElement | null) => {
  const json = sessionStorage.getItem(`scrollPos:${path}`);
  if (!elt) return;
  const scrollPos = json ? (JSON.parse(json) as { top: number }) : undefined;
  if (scrollPos) {
    elt.scrollTo({ top: scrollPos.top });
  }
};

export function useScrollRestoration(ref: RefObject<HTMLElement | null>) {
  const location = useLocation();
  const path = location.pathname + location.search;

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;
    window.history.scrollRestoration = "manual";
    const elt = ref.current;
    restoreScrollPos(path, elt);
    return () => {
      saveScrollPos(path, elt);
    };
  }, [path, ref]);
}
