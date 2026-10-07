<script setup lang="ts">
import { keepPreviousData } from "@tanstack/vue-query";
import { computed } from "vue";
import { RouterLink } from "vue-router";

import { formatISODateFR } from "@livrelibre/shared/date";
import { formatTVA } from "@livrelibre/shared/format";
import { ITEM_TYPES } from "@livrelibre/shared/item";
import { ITEMS_PER_PAGE } from "@livrelibre/shared/pagination";
import { isIn } from "@livrelibre/shared/utils";

import AppCard from "@/components/AppCard.vue";
import AppPagination from "@/components/AppPagination.vue";
import CardBody from "@/components/CardBody.vue";
import CardFooter from "@/components/CardFooter.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import ItemsTable from "@/components/ItemsTable.vue";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import { useTRPCQuery } from "@/utils/query";
import { useDelayedLoading } from "@/utils/useDelayedLoading";
import { usePageParam, useQueryParams } from "@/utils/useQueryParams";

const CARD_STYLES = "max-h-full overflow-hidden flex flex-col relative";

const FIELD_LABELS: Record<string, string> = {
  type: "Type",
  isbn: "ISBN",
  author: "Auteur·ice",
  title: "Titre",
  publisher: "Maison d'édition",
  distributor: "Distributeur",
  keywords: "Mots-clés",
  datebought: "Date d'achat",
  comments: "Commentaires",
  price: "Prix de vente",
  amount: "Quantité",
  tva: "TVA",
};

const formatRow = ([key, value]: [string, string]) => {
  const fieldName = isIn(FIELD_LABELS, key) ? FIELD_LABELS[key] : key;
  let fieldValue = value;
  if (key === "type" && isIn(ITEM_TYPES, value)) {
    fieldValue = ITEM_TYPES[value];
  } else if (key === "tva") {
    fieldValue = formatTVA(value) || "";
  } else if (key === "datebought") {
    fieldValue = formatISODateFR(value);
  }
  return `${fieldName}: ${fieldValue}`;
};

const getQueryLabel = (query: Record<string, string>) =>
  Object.entries(query)
    .filter(([, value]) => value !== "")
    .map(formatRow)
    .join(", ");

const { query, push } = useQueryParams();

const toggleStock = async () => {
  const { inStock: _inStock, ...rest } = query.value;
  if (!query.value.inStock) {
    rest.inStock = "1";
  }
  await push({ query: rest });
};

const searchQuery = computed(() => {
  const body: Record<string, string> = {};
  for (const [key, value] of Object.entries(query.value)) {
    if (typeof value === "string" && key !== "page") {
      body[key] = value;
    }
  }
  return body;
});
const page = usePageParam();

const {
  data: list,
  isSuccess,
  isError,
  isFetching,
  refetch,
} = useTRPCQuery(
  "advancedSearch",
  computed(() => ({ search: searchQuery.value, page: page.value })),
  { placeholderData: keepPreviousData },
);
const showLoading = useDelayedLoading(isFetching, 500);

const pageCount = computed(() =>
  list.value ? Math.ceil(list.value.count / ITEMS_PER_PAGE) : 0,
);
const queryLabel = computed(() => getQueryLabel(searchQuery.value));
const cardTitle = computed(() => {
  let title = "Recherche avancée";
  if (pageCount.value > 1) {
    title += ` - Page ${String(page.value)} sur ${String(pageCount.value)}`;
  }
  return title;
});
</script>

<template>
  <div class="flex flex-1 flex-col gap-lg">
    <AppCard v-if="isSuccess && list?.count === 0" :class="CARD_STYLES">
      <CardTitle :level="1">{{ cardTitle }}</CardTitle>
      <label class="self-end cursor-pointer mr-6 ml-auto">
        <span>En stock</span>
        <input
          type="checkbox"
          class="ml-2"
          :checked="query.inStock === '1'"
          @change="toggleStock"
        />
      </label>
      <CardBody>Aucun résultat pour "{{ queryLabel }}"</CardBody>
      <p class="mt-2">
        <RouterLink to="/search" class="text-primary-darkest">
          Nouvelle recherche
        </RouterLink>
      </p>
    </AppCard>
    <AppCard v-else :class="CARD_STYLES">
      <CardTitle :level="1">{{ cardTitle }}</CardTitle>
      <div class="flex flex-1">
        <p>
          Recherche en cours…<template v-if="isSuccess">
            : {{ list?.count }} résultat{{
              (list?.count ?? 0) > 1 ? "s" : ""
            }}
            pour {{ queryLabel }}</template
          >
        </p>
        <label class="self-end cursor-pointer mr-6 ml-auto">
          <span>En stock</span>
          <input
            type="checkbox"
            class="ml-2"
            :checked="query.inStock === '1'"
            @change="toggleStock"
          />
        </label>
      </div>
      <CardBody>
        <ErrorMessage v-if="isError" :on-retry="refetch" />
        <LoadingOverlay :loading="isSuccess && showLoading">
          <ItemsTable :items="list?.items ?? []" />
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
