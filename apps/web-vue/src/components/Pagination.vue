<script setup lang="ts">
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed } from "vue";
import { RouterLink } from "vue-router";

import { useQueryParams } from "@/utils/useQueryParams";

const props = defineProps<{ count: number }>();

const LINK_STYLES =
  "border px-md py-sm text-primary-darker [border-color:#AAA]";

const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
};

const createPageList = (pageNumber: number, count: number) => {
  const startPages = range(1, Math.min(1, count));
  const endPages = range(Math.max(count, 2), count);

  const siblingsStart = Math.max(Math.min(pageNumber - 2, count - 6), 3);
  const siblingsEnd = Math.min(
    Math.max(pageNumber + 2, 7),
    endPages.length > 0 ? endPages[0] - 2 : count - 1,
  );

  return [
    ...startPages,
    ...(siblingsStart > 3 ? [0] : count > 3 ? [2] : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - 2 ? [0] : count > 2 ? [count - 1] : []),
    ...endPages,
  ];
};

const { query, pathname, searchParams } = useQueryParams();

const page = computed(() => {
  const queryPage = query.value.page;
  return typeof queryPage === "string" ? Number(queryPage) : 1;
});

const makeHref = (nb: number) => {
  const params = new URLSearchParams(searchParams.value);
  params.set("page", String(nb));
  return `${pathname.value}?${params.toString()}`;
};

const pageList = computed(() => createPageList(page.value, props.count));
</script>

<template>
  <ol class="flex">
    <li>
      <RouterLink
        v-if="page > 1"
        :to="makeHref(page - 1)"
        :class="[LINK_STYLES, 'rounded-l-md']"
        title="Page précédente"
      >
        <FontAwesomeIcon :icon="faChevronLeft" />
      </RouterLink>
      <span v-else :class="LINK_STYLES">
        <FontAwesomeIcon :icon="faChevronLeft" />
      </span>
    </li>
    <li v-for="n in pageList" :key="n">
      <span
        v-if="n === page"
        :class="
          LINK_STYLES + ' text-white bg-primary-darker border-primary-darker'
        "
      >
        {{ n }}
      </span>
      <RouterLink v-else-if="n > 0" :to="makeHref(n)" :class="LINK_STYLES">
        {{ n }}
      </RouterLink>
      <span v-else :class="LINK_STYLES">…</span>
    </li>
    <li>
      <RouterLink
        v-if="page < props.count"
        :to="makeHref(page + 1)"
        :class="[LINK_STYLES, 'rounded-r-md']"
        title="Page suivante"
      >
        <FontAwesomeIcon :icon="faChevronRight" />
      </RouterLink>
      <span v-else :class="LINK_STYLES">
        <FontAwesomeIcon :icon="faChevronRight" />
      </span>
    </li>
  </ol>
</template>
