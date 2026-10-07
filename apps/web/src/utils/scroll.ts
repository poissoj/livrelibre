import { type Ref, computed, onMounted } from "vue";
import { onBeforeRouteLeave, useRoute } from "vue-router";

const saveScrollPos = (path: string, elt: HTMLElement | null) => {
  if (!elt) return;
  sessionStorage.setItem(`scrollPos:${path}`, JSON.stringify({ top: elt.scrollTop }));
};

const restoreScrollPos = (path: string, elt: HTMLElement | null) => {
  if (!elt) return;
  const json = sessionStorage.getItem(`scrollPos:${path}`);
  const scrollPos = json ? (JSON.parse(json) as { top: number }) : undefined;
  if (scrollPos) {
    elt.scrollTo({ top: scrollPos.top });
  }
};

export function useScrollRestoration(ref: Ref<HTMLElement | null>) {
  const route = useRoute();
  const path = computed(() => route.fullPath);

  onMounted(() => {
    if (!("scrollRestoration" in window.history)) return;
    window.history.scrollRestoration = "manual";
    restoreScrollPos(path.value, ref.value);
  });

  onBeforeRouteLeave(() => {
    saveScrollPos(path.value, ref.value);
  });
}
