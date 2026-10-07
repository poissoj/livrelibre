<script setup lang="ts">
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed } from "vue";
import { RouterLink } from "vue-router";

import { usePageParam, useQueryParams } from "@/utils/useQueryParams";

const props = defineProps<{ count: number }>();

const LINK_STYLES = "border px-md py-sm text-primary-darker [border-color:#AAA]";

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

const { pathname, searchParams } = useQueryParams();

const page = usePageParam();

const makeHref = (nb: number) => {
  const params = new URLSearchParams(searchParams.value);
  params.set("page", String(nb));
  return `${pathname.value}?${params.toString()}`;
};

const pageList = computed(() => createPageList(page.value, props.count));
</script>

<template>
  <nav :aria-label="`Pagination, page ${page} sur ${props.count}`">
    <ol class="flex">
      <li>
        <RouterLink v-if="page > 1" v-slot="{ href, navigate }" :to="makeHref(page - 1)" custom>
          <a
            :href="href"
            :class="[LINK_STYLES, 'rounded-l-md']"
            aria-label="Page précédente"
            title="Page précédente"
            @click="navigate"
          >
            <FontAwesomeIcon :icon="faChevronLeft" aria-hidden="true" />
          </a>
        </RouterLink>
        <span v-else :class="[LINK_STYLES, 'rounded-l-md']" aria-hidden="true">
          <FontAwesomeIcon :icon="faChevronLeft" />
        </span>
      </li>
      <li v-for="n in pageList" :key="n">
        <span
          v-if="n === page"
          :class="LINK_STYLES + ' text-white bg-primary-darker border-primary-darker'"
          aria-current="page"
        >
          {{ n }}
        </span>
        <RouterLink v-else-if="n > 0" v-slot="{ href, navigate }" :to="makeHref(n)" custom>
          <a :href="href" :class="LINK_STYLES" :aria-label="`Page ${n}`" @click="navigate">
            {{ n }}
          </a>
        </RouterLink>
        <span v-else :class="LINK_STYLES" aria-hidden="true">…</span>
      </li>
      <li>
        <RouterLink
          v-if="page < props.count"
          v-slot="{ href, navigate }"
          :to="makeHref(page + 1)"
          custom
        >
          <a
            :href="href"
            :class="[LINK_STYLES, 'rounded-r-md']"
            aria-label="Page suivante"
            title="Page suivante"
            @click="navigate"
          >
            <FontAwesomeIcon :icon="faChevronRight" aria-hidden="true" />
          </a>
        </RouterLink>
        <span v-else :class="[LINK_STYLES, 'rounded-r-md']" aria-hidden="true">
          <FontAwesomeIcon :icon="faChevronRight" />
        </span>
      </li>
    </ol>
  </nav>
</template>
