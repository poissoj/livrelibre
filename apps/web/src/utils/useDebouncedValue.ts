import { customRef, type MaybeRefOrGetter, type Ref, onScopeDispose, toValue, watch } from "vue";

export const useDebouncedValue = <T extends string | number | boolean>(
  value: MaybeRefOrGetter<T>,
  delay = 300,
): Ref<T> => {
  let current = toValue(value);
  let timer: ReturnType<typeof setTimeout> | undefined;

  const debounced = customRef<T>((track, trigger) => ({
    get() {
      track();
      return current;
    },
    set(next) {
      current = next;
      trigger();
    },
  }));

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
