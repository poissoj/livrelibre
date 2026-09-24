<script setup lang="ts">
import { keepPreviousData } from "@tanstack/vue-query";
import { computed } from "vue";

import { ITEMS_PER_PAGE } from "@livrelibre/shared/pagination";

import Card from "@/components/Card.vue";
import CardBody from "@/components/CardBody.vue";
import CardFooter from "@/components/CardFooter.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import ItemsTable from "@/components/ItemsTable.vue";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import Pagination from "@/components/Pagination.vue";
import Title from "@/components/Title.vue";
import { useTRPCQuery } from "@/utils/query";
import { useDelayedLoading } from "@/utils/useDelayedLoading";
import { useQueryParams } from "@/utils/useQueryParams";

const CARD_STYLES = "max-h-full overflow-hidden flex flex-col relative";

const { query, push } = useQueryParams();

const search = computed(() =>
  typeof query.value.search === "string" ? query.value.search : "",
);
const page = computed(() => {
  const queryPage = query.value.page;
  return typeof queryPage === "string" ? Number(queryPage) : 1;
});
const inStock = computed(() => query.value.inStock === "1");

const toggleStock = async () => {
  const next = inStock.value
    ? { search: search.value }
    : { search: search.value, inStock: 1 };
  await push({ query: next });
};

const result = useTRPCQuery(
  "quicksearch",
  computed(() => ({
    search: search.value,
    page: page.value,
    inStock: inStock.value,
  })),
  { placeholderData: keepPreviousData },
);
const showLoading = useDelayedLoading(
  computed(() => result.isFetching.value),
  500,
);

const pageCount = computed(() =>
  result.data.value ? Math.ceil(result.data.value.count / ITEMS_PER_PAGE) : 0,
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
    `${String(result.data.value?.count ?? 0)} résultat${(result.data.value?.count ?? 0) > 1 ? "s" : ""} pour ${search.value}`,
);
</script>

<template>
  <div class="flex flex-1 flex-col gap-lg">
    <Title>{{ `Recherche de "${search}"` }}</Title>
    <Card
      v-if="result.isSuccess.value && result.data.value?.count === 0"
      :class="CARD_STYLES"
    >
      <CardTitle>{{ cardTitle }}</CardTitle>
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
    </Card>
    <Card v-else :class="CARD_STYLES">
      <CardTitle>{{ cardTitle }}</CardTitle>
      <div class="flex flex-1">
        <p>{{ result.isSuccess.value ? subtitle : "Recherche en cours…" }}</p>
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
        <ErrorMessage v-if="result.isError.value" />
        <LoadingOverlay v-if="result.isSuccess.value && showLoading">
          <ItemsTable :items="result.data.value?.items ?? []" />
        </LoadingOverlay>
        <ItemsTable
          v-else-if="result.isSuccess.value"
          :items="result.data.value?.items ?? []"
        />
      </CardBody>
      <CardFooter
        v-if="pageCount > 1"
        class="flex justify-center pt-6 2xl:pt-8"
      >
        <Pagination :count="pageCount" />
      </CardFooter>
    </Card>
  </div>
</template>
