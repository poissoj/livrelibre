<script setup lang="ts">
import { keepPreviousData } from "@tanstack/vue-query";
import { computed } from "vue";

import { ITEMS_PER_PAGE } from "@livrelibre/shared/pagination";

import AppCard from "@/components/AppCard.vue";
import AppPagination from "@/components/AppPagination.vue";
import CardBody from "@/components/CardBody.vue";
import CardFooter from "@/components/CardFooter.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import ItemsTable from "@/components/ItemsTable.vue";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import { useTitle } from "@/lib/useTitle";
import { useTRPCQuery } from "@/utils/query";
import { useDelayedLoading } from "@/utils/useDelayedLoading";
import { usePageParam, useQueryParams } from "@/utils/useQueryParams";

const CARD_STYLES = "max-h-full overflow-hidden flex flex-col relative";

const { query, push } = useQueryParams();

const search = computed(() =>
  typeof query.value.search === "string" ? query.value.search : "",
);
useTitle(() => `Recherche de "${search.value}"`);
const page = usePageParam();
const inStock = computed(() => query.value.inStock === "1");

const toggleStock = async () => {
  const next = inStock.value
    ? { search: search.value }
    : { search: search.value, inStock: 1 };
  await push({ query: next });
};

const {
  data: searchResult,
  isError,
  isSuccess,
  isFetching,
  refetch,
} = useTRPCQuery(
  "quicksearch",
  computed(() => ({
    search: search.value,
    page: page.value,
    inStock: inStock.value,
  })),
  { placeholderData: keepPreviousData },
);
const showLoading = useDelayedLoading(isFetching, 500);

const pageCount = computed(() =>
  searchResult.value ? Math.ceil(searchResult.value.count / ITEMS_PER_PAGE) : 0,
);
const cardTitle = computed(() => {
  let title = "Recherche rapide";
  if (pageCount.value > 1) {
    title += ` - Page ${String(page.value)} sur ${String(pageCount.value)}`;
  }
  return title;
});
const subtitle = computed(
  () =>
    `${String(searchResult.value?.count ?? 0)} résultat${(searchResult.value?.count ?? 0) > 1 ? "s" : ""} pour ${search.value}`,
);
</script>

<template>
  <div class="flex flex-1 flex-col gap-lg">
    <AppCard v-if="isSuccess && searchResult?.count === 0" :class="CARD_STYLES">
      <CardTitle :level="1">{{ cardTitle }}</CardTitle>
      <label class="self-end cursor-pointer mr-6 ml-auto">
        <span>En stock</span>
        <input
          type="checkbox"
          class="ml-2"
          :checked="inStock"
          @change="toggleStock"
        />
      </label>
      <CardBody>Aucun résultat pour "{{ search }}"</CardBody>
    </AppCard>
    <AppCard v-else :class="CARD_STYLES">
      <CardTitle :level="1">{{ cardTitle }}</CardTitle>
      <div class="flex flex-1">
        <p>{{ isSuccess ? subtitle : "Recherche en cours…" }}</p>
        <label class="self-end cursor-pointer mr-6 ml-auto">
          <span>En stock</span>
          <input
            type="checkbox"
            class="ml-2"
            :checked="inStock"
            @change="toggleStock"
          />
        </label>
      </div>
      <CardBody>
        <ErrorMessage v-if="isError" :on-retry="refetch" />
        <LoadingOverlay :loading="isSuccess && showLoading">
          <ItemsTable :items="searchResult?.items ?? []" />
        </LoadingOverlay>
      </CardBody>
      <CardFooter
        v-if="pageCount > 1"
        class="flex justify-center pt-6 2xl:pt-8"
      >
        <AppPagination :count="pageCount" />
      </CardFooter>
    </AppCard>
  </div>
</template>
