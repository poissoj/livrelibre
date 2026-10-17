<script setup lang="ts">
import { formatNumber } from "@livrelibre/shared/format";
import { useQuery } from "@tanstack/vue-query";
import { clsx } from "clsx";
import { computed, ref, watch } from "vue";
import { RouterLink } from "vue-router";

import AppCard from "@/components/AppCard.vue";
import AppInput from "@/components/AppInput.vue";
import AppSkeleton from "@/components/AppSkeleton.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import { queryKeys } from "@/lib/queryKeys";
import { trpcClient } from "@/utils/trpc";
import { useQueryParams } from "@/utils/useQueryParams";

const TH_STYLES = "sticky top-0 bg-white";

const { query, push } = useQueryParams();

const qs = (key: string): string => {
  const value = query.value[key];
  return typeof value === "string" ? value : "";
};

const dateFrom = ref("");
const dateTo = ref("");

const syncFromQuery = () => {
  dateFrom.value = qs("dateFrom");
  dateTo.value = qs("dateTo");
};
syncFromQuery();
watch(query, syncFromQuery);

const searchInput = computed(() => {
  const from = qs("dateFrom");
  const to = qs("dateTo");
  return {
    ...(from ? { dateFrom: from } : {}),
    ...(to ? { dateTo: to } : {}),
  };
});

const onDateChange = () => {
  const next: Record<string, string> = {};
  for (const [key, value] of Object.entries(query.value)) {
    next[key] = Array.isArray(value) ? (value[0] ?? "") : value;
  }
  if (dateFrom.value) {
    next.dateFrom = dateFrom.value;
  } else {
    delete next.dateFrom;
  }
  if (dateTo.value) {
    next.dateTo = dateTo.value;
  } else {
    delete next.dateTo;
  }
  void push({ query: next, replace: true });
};

const {
  data: bestSales,
  isPending,
  isError,
  refetch,
} = useQuery({
  queryKey: () => queryKeys.sales.best(searchInput.value),
  queryFn: () => trpcClient.bestsales.query(searchInput.value),
});
</script>

<template>
  <div class="[margin-left:10%] [margin-right:10%] flex flex-1 flex-col gap-lg">
    <AppCard class="max-h-full overflow-hidden flex flex-col">
      <CardTitle :level="1">Meilleures ventes</CardTitle>
      <form class="mt-sm flex flex-wrap gap-x-lg" @submit.prevent="onDateChange">
        <label class="flex items-center gap-sm">
          <span>Du</span>
          <AppInput v-model="dateFrom" type="date" @change="onDateChange" />
        </label>
        <label class="flex items-center gap-sm">
          <span>Au</span>
          <AppInput v-model="dateTo" type="date" @change="onDateChange" />
        </label>
      </form>
      <CardBody>
        <ErrorMessage v-if="isError" :on-retry="refetch" />
        <AppSkeleton v-else-if="isPending" :height="500">
          <template v-for="n in 17" :key="n">
            <rect x="2%" :y="(n - 1) * 30 + 10" width="3%" :height="10" rx="5" />
            <rect x="10%" :y="(n - 1) * 30 + 10" width="40%" :height="10" />
            <rect x="60%" :y="(n - 1) * 30 + 10" width="20%" :height="10" />
            <rect x="83%" :y="(n - 1) * 30 + 10" width="6%" :height="10" rx="5" />
            <rect x="92%" :y="(n - 1) * 30 + 10" width="6%" :height="10" rx="5" />
          </template>
        </AppSkeleton>
        <table v-else class="flex-1 [border-collapse:separate] [border-spacing:2px_0.5rem]">
          <caption class="sr-only">
            Meilleures ventes
          </caption>
          <thead>
            <tr>
              <th scope="col" :class="clsx(TH_STYLES, 'text-left')">#</th>
              <th scope="col" :class="clsx(TH_STYLES, 'text-left')">Titre</th>
              <th scope="col" :class="clsx(TH_STYLES, 'text-left')">Auteur·ice</th>
              <th scope="col" :class="clsx(TH_STYLES, 'text-right')">Vendus</th>
              <th scope="col" :class="clsx(TH_STYLES, 'text-right whitespace-nowrap')">En stock</th>
              <th scope="col" :class="TH_STYLES">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in bestSales ?? []" :key="item.id">
              <td>{{ i + 1 }}</td>
              <td>
                <span class="text-primary-darkest">
                  <RouterLink :to="`/item/${String(item.id)}`">
                    {{ item.title }}
                  </RouterLink>
                </span>
              </td>
              <td>{{ item.author }}</td>
              <td class="text-right font-number">
                {{ formatNumber(Number(item.count)) }}
              </td>
              <td class="pr-3 text-right font-number">
                {{ formatNumber(item.amount) }}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </CardBody>
    </AppCard>
  </div>
</template>
