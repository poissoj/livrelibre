import { type Ref, computed, onMounted } from "vue";
import { onBeforeRouteLeave, useRoute } from "vue-router";

const saveScrollPos = (path: string, elt: HTMLElement | null) => {
  if (!elt) return;
  sessionStorage.setItem(`scrollPos:${path}`, JSON.stringify({ top: elt.scrollTop }));
};

const isScrollPosition = (value: unknown): value is { top: number } =>
  typeof value === "object" && value !== null && "top" in value && typeof value.top === "number";

const restoreScrollPos = (path: string, elt: HTMLElement | null) => {
  if (!elt) return;
  const json = sessionStorage.getItem(`scrollPos:${path}`);
  const parsed: unknown = json ? JSON.parse(json) : undefined;
  if (isScrollPosition(parsed)) {
    elt.scrollTo({ top: parsed.top });
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
