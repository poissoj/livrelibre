<script setup lang="ts">
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { ITEMS_PER_PAGE } from "@livrelibre/shared/pagination";
import { PAYMENT_METHODS, type PaymentType } from "@livrelibre/shared/sale";
import { keepPreviousData, useQuery } from "@tanstack/vue-query";
import { computed, ref, watch } from "vue";

import AppButton from "@/components/AppButton.vue";
import AppCard from "@/components/AppCard.vue";
import AppInput from "@/components/AppInput.vue";
import AppPagination from "@/components/AppPagination.vue";
import AppSelect from "@/components/AppSelect.vue";
import CardBody from "@/components/CardBody.vue";
import CardFooter from "@/components/CardFooter.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import RestrictedContent from "@/components/RestrictedContent.vue";
import SalesSearchTable from "@/components/Sales/SalesSearchTable.vue";
import { trpcClient } from "@/utils/trpc";
import { useDelayedLoading } from "@/utils/useDelayedLoading";
import { usePageParam, useQueryParams } from "@/utils/useQueryParams";

const CARD_STYLES = "max-h-full overflow-hidden flex flex-col relative";

const { query, push } = useQueryParams();
const page = usePageParam();

const qs = (key: string): string => {
  const value = query.value[key];
  return typeof value === "string" ? value : "";
};

const title = ref("");
const dateFrom = ref("");
const dateTo = ref("");
const paymentType = ref("");
const includeDeleted = ref(false);

const syncFromQuery = () => {
  title.value = qs("title");
  dateFrom.value = qs("dateFrom");
  dateTo.value = qs("dateTo");
  paymentType.value = qs("paymentType");
  includeDeleted.value = qs("includeDeleted") === "1";
};
syncFromQuery();
watch(query, syncFromQuery);

const isPaymentType = (value: string): value is PaymentType =>
  Object.prototype.hasOwnProperty.call(PAYMENT_METHODS, value);

const payment = computed(() => {
  const value = qs("paymentType");
  return isPaymentType(value) ? value : undefined;
});

const searchInput = computed(() => {
  const from = qs("dateFrom");
  const to = qs("dateTo");
  return {
    title: qs("title"),
    includeDeleted: qs("includeDeleted") === "1",
    page: page.value,
    ...(from ? { dateFrom: from } : {}),
    ...(to ? { dateTo: to } : {}),
    ...(payment.value ? { paymentType: payment.value } : {}),
  };
});

const onSubmit = async () => {
  const next: Record<string, string> = {};
  if (title.value.trim()) next.title = title.value.trim();
  if (dateFrom.value) next.dateFrom = dateFrom.value;
  if (dateTo.value) next.dateTo = dateTo.value;
  if (paymentType.value) next.paymentType = paymentType.value;
  if (includeDeleted.value) next.includeDeleted = "1";
  await push({ query: next });
};

const {
  data: results,
  isSuccess,
  isError,
  isFetching,
  refetch,
} = useQuery({
  queryKey: ["searchSales", () => searchInput.value],
  queryFn: () => trpcClient.searchSales.query(searchInput.value),
  placeholderData: keepPreviousData,
});
const showLoading = useDelayedLoading(isFetching, 500);

const pageCount = computed(() =>
  results.value ? Math.ceil(results.value.count / ITEMS_PER_PAGE) : 0,
);
const count = computed(() => results.value?.count ?? 0);
const cardTitle = computed(() => {
  let value = "Rechercher une vente";
  if (pageCount.value > 1) {
    value += ` - Page ${String(page.value)} sur ${String(pageCount.value)}`;
  }
  return value;
});
</script>

<template>
  <RestrictedContent role="admin">
    <div class="flex flex-1 flex-col">
      <AppCard :class="CARD_STYLES">
        <CardTitle :level="1">{{ cardTitle }}</CardTitle>
        <form class="my-sm flex flex-col gap-sm" @submit.prevent="onSubmit">
          <div class="flex flex-wrap gap-sm">
            <label class="flex flex-1 min-w-48 flex-col text-sm">
              <span>Titre</span>
              <AppInput v-model="title" type="text" />
            </label>
            <label class="flex w-40 flex-col text-sm">
              <span>Du</span>
              <AppInput v-model="dateFrom" type="date" />
            </label>
            <label class="flex w-40 flex-col text-sm">
              <span>Au</span>
              <AppInput v-model="dateTo" type="date" />
            </label>
            <label class="flex w-40 flex-col text-sm">
              <span>Paiement</span>
              <AppSelect v-model="paymentType">
                <option value="">--ignorer--</option>
                <option v-for="(label, value) in PAYMENT_METHODS" :key="value" :value="value">
                  {{ label }}
                </option>
              </AppSelect>
            </label>
          </div>
          <div class="flex gap-sm items-end">
            <AppButton type="submit" class="px-md" aria-label="Rechercher une vente">
              <FontAwesomeIcon :icon="faSearch" class="mr-sm" />
              Rechercher
            </AppButton>
            <label class="flex items-center gap-xs text-sm">
              <input v-model="includeDeleted" type="checkbox" />
              Inclure les ventes supprimées
            </label>
          </div>
        </form>
        <p class="mt-sm">{{ count }} résultat{{ count > 1 ? "s" : "" }}</p>
        <CardBody class="mt-0!">
          <ErrorMessage v-if="isError" :on-retry="refetch" />
          <LoadingOverlay v-else :loading="isSuccess && showLoading">
            <p v-if="isSuccess && count === 0">Aucun résultat.</p>
            <SalesSearchTable v-else :sales="results?.sales ?? []" />
          </LoadingOverlay>
        </CardBody>
        <CardFooter v-if="pageCount > 1" class="flex justify-center pt-6 2xl:pt-8">
          <AppPagination :count="pageCount" />
        </CardFooter>
      </AppCard>
    </div>
  </RestrictedContent>
</template>
