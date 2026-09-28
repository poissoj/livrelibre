import { type MaybeRefOrGetter, toValue, watchEffect } from "vue";

import { APP_NAME } from "./config";

export const useTitle = (title: MaybeRefOrGetter<string>): void => {
  watchEffect(() => {
    document.title = `${toValue(title)} | ${APP_NAME}`;
  });
};
