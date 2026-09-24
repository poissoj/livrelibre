import { type MaybeRefOrGetter, type Ref, ref, toValue, watch } from "vue";

export const useDelayedLoading = (
  isLoading: MaybeRefOrGetter<boolean>,
  delay = 500,
): Ref<boolean> => {
  const show = ref(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  watch(
    () => toValue(isLoading),
    (loading) => {
      clearTimeout(timer);
      if (!loading) {
        show.value = false;
        return;
      }
      timer = setTimeout(() => {
        show.value = true;
      }, delay);
    },
    { immediate: true },
  );

  return show;
};
