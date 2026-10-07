import { type MaybeRefOrGetter, type Ref, onScopeDispose, ref, toValue, watch } from "vue";

export const useDebouncedValue = <T>(value: MaybeRefOrGetter<T>, delay = 300): Ref<T> => {
  const debounced = ref(toValue(value)) as Ref<T>;
  let timer: ReturnType<typeof setTimeout> | undefined;

  watch(
    () => toValue(value),
    (next) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        debounced.value = next;
      }, delay);
    },
  );

  onScopeDispose(() => {
    clearTimeout(timer);
  });

  return debounced;
};
