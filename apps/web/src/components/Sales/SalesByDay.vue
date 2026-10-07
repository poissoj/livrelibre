<script setup lang="ts">
import { formatPrice } from "@livrelibre/shared/format";
import { PAYMENT_METHODS } from "@livrelibre/shared/sale";
import { computed, ref } from "vue";

import AppCard from "@/components/AppCard.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import CategoriesTable from "@/components/PaymentStats/CategoriesTable.vue";
import CategorySkeleton from "@/components/PaymentStats/CategorySkeleton.vue";
import SalesSkeleton from "@/components/Sales/SalesSkeleton.vue";
import SalesTable from "@/components/Sales/SalesTable.vue";
import StatsByTVA from "@/components/TVAStats/StatsByTVA.vue";
import TVASkeleton from "@/components/TVAStats/TVASkeleton.vue";
import { useTitle } from "@/lib/useTitle";
import { useTRPCQuery } from "@/utils/query";
import { useScrollRestoration } from "@/utils/scroll";

const props = defineProps<{ date: string }>();

const root = ref<HTMLElement | null>(null);
useScrollRestoration(root);

const {
  data: dayStats,
  isPending,
  isError,
  refetch,
} = useTRPCQuery(
  "salesByDay",
  computed(() => props.date),
);

const formatDate = (date: string) => date.split("-").reverse().join("/");

const title = computed(() => `Liste des ventes du ${formatDate(props.date)}`);
useTitle(title);

const salesTitle = computed(() =>
  isPending.value
    ? `Ventes du ${props.date}`
    : `Ventes du ${formatDate(props.date)} (${String(dayStats.value?.salesCount ?? 0)})`,
);
const categories = computed(() =>
  (dayStats.value?.paymentMethods ?? []).map((method) => ({
    ...method,
    label: PAYMENT_METHODS[method.type],
  })),
);
</script>

<template>
  <div
    ref="root"
    class="flex flex-1 flex-col gap-lg max-h-full overflow-auto pr-1 pb-1 -mr-1 -mb-1"
  >
    <div class="flex gap-lg items-start flex-wrap">
      <AppCard class="flex-1">
        <CardTitle>Répartition par TVA</CardTitle>
        <CardBody>
          <ErrorMessage v-if="isError" :on-retry="refetch" />
          <TVASkeleton v-else-if="isPending" />
          <StatsByTVA v-else :stats="dayStats?.tva ?? []" />
        </CardBody>
      </AppCard>
      <AppCard class="flex-1">
        <CardTitle>Répartition par type de paiement</CardTitle>
        <CardBody>
          <ErrorMessage v-if="isError" :on-retry="refetch" />
          <CategorySkeleton v-else-if="isPending" />
          <div v-else class="flex flex-1 flex-col gap-3">
            <CategoriesTable :categories="categories" />
            <p class="self-end">
              <strong>Total&nbsp;: </strong>
              <span class="font-number">
                {{ formatPrice(dayStats?.total ?? 0) }}
              </span>
            </p>
          </div>
        </CardBody>
      </AppCard>
    </div>
    <AppCard class="flex flex-col">
      <CardTitle :level="1">{{ salesTitle }}</CardTitle>
      <CardBody>
        <ErrorMessage v-if="isError" :on-retry="refetch" />
        <SalesSkeleton v-else-if="isPending" />
        <SalesTable v-else :carts="dayStats?.carts ?? []" />
      </CardBody>
    </AppCard>
  </div>
</template>
