import { type MaybeRefOrGetter, toValue, watchEffect } from "vue";

import { formatPageTitle } from "./pageTitle";

/**
 * Overrides the document title for routes whose title depends on loaded data
 * (item name, search term, page number…). Static titles belong to `meta.title`
 * (applied by the router); this composable takes precedence once mounted.
 */
export const useTitle = (title: MaybeRefOrGetter<string>): void => {
  watchEffect(() => {
    document.title = formatPageTitle(toValue(title));
  });
};
