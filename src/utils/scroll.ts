import Router, { useRouter } from "next/router";
import type { RefObject } from "react";
import { useEffect } from "react";

const saveScrollPos = (asPath: string, elt: HTMLElement | null) => {
  if (!elt) return;
  sessionStorage.setItem(
    `scrollPos:${asPath}`,
    JSON.stringify({ top: elt.scrollTop }),
  );
};

const restoreScrollPos = (asPath: string, elt: HTMLElement | null) => {
  const json = sessionStorage.getItem(`scrollPos:${asPath}`);
  if (!elt) return;
  const scrollPos = json ? (JSON.parse(json) as { top: number }) : undefined;
  if (scrollPos) {
    elt.scrollTo({ top: scrollPos.top });
  }
};

export function useScrollRestoration(ref: RefObject<HTMLElement>) {
  const router = useRouter();
  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;
    let shouldScrollRestore = false;
    window.history.scrollRestoration = "manual";
    restoreScrollPos(router.asPath, ref.current);

    const onBeforeUnload = () => {
      saveScrollPos(router.asPath, ref.current);
    };

    const onRouteChangeStart = () => {
      saveScrollPos(router.asPath, ref.current);
    };

    const onRouteChangeComplete = (url: string) => {
      if (shouldScrollRestore) {
        shouldScrollRestore = false;
        /**
         * Calling with relative url, not expected asPath, so this
         * will break if there is a basePath or locale path prefix.
         */
        restoreScrollPos(url, ref.current);
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    Router.events.on("routeChangeStart", onRouteChangeStart);
    Router.events.on("routeChangeComplete", onRouteChangeComplete);
    Router.beforePopState(() => {
      shouldScrollRestore = true;
      return true;
    });

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      Router.events.off("routeChangeStart", onRouteChangeStart);
      Router.events.off("routeChangeComplete", onRouteChangeComplete);
      Router.beforePopState(() => true);
    };
  }, [router, ref]);
}
