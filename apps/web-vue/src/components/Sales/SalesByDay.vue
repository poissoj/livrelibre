<script setup lang="ts">
import { computed, ref } from "vue";

import { formatPrice } from "@livrelibre/shared/format";
import { PAYMENT_METHODS } from "@livrelibre/shared/sale";

import Card from "@/components/Card.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import CategoriesTable from "@/components/PaymentStats/CategoriesTable.vue";
import CategorySkeleton from "@/components/PaymentStats/CategorySkeleton.vue";
import SalesSkeleton from "@/components/Sales/SalesSkeleton.vue";
import SalesTable from "@/components/Sales/SalesTable.vue";
import StatsByTVA from "@/components/TVAStats/StatsByTVA.vue";
import TVASkeleton from "@/components/TVAStats/TVASkeleton.vue";
import Title from "@/components/Title.vue";
import { useTRPCQuery } from "@/utils/query";
import { useScrollRestoration } from "@/utils/scroll";

const props = defineProps<{ date: string }>();

const root = ref<HTMLElement | null>(null);
useScrollRestoration(root);

const result = useTRPCQuery(
  "salesByDay",
  computed(() => props.date),
);

const formatDate = (date: string) => date.split("-").reverse().join("/");

const title = computed(() => `Liste des ventes du ${formatDate(props.date)}`);
const salesTitle = computed(() =>
  result.isPending.value
    ? `Ventes du ${props.date}`
    : `Ventes du ${formatDate(props.date)} (${String(result.data.value?.salesCount ?? 0)})`,
);
const categories = computed(() =>
  (result.data.value?.paymentMethods ?? []).map((method) => ({
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
    <Title>{{ title }}</Title>
    <div class="flex gap-lg items-start flex-wrap">
      <Card class="flex-1">
        <CardTitle>Répartition par TVA</CardTitle>
        <CardBody>
          <ErrorMessage v-if="result.isError.value" />
          <TVASkeleton v-else-if="result.isPending.value" />
          <StatsByTVA v-else :stats="result.data.value?.tva ?? []" />
        </CardBody>
      </Card>
      <Card class="flex-1">
        <CardTitle>Répartition par type de paiement</CardTitle>
        <CardBody>
          <ErrorMessage v-if="result.isError.value" />
          <CategorySkeleton v-else-if="result.isPending.value" />
          <div v-else class="flex flex-1 flex-col gap-3">
            <CategoriesTable :categories="categories" />
            <p class="self-end">
              <strong>Total&nbsp;: </strong>
              <span class="font-number">
                {{ formatPrice(result.data.value?.total ?? 0) }}
              </span>
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
    <Card class="flex flex-col">
      <CardTitle>{{ salesTitle }}</CardTitle>
      <CardBody>
        <ErrorMessage v-if="result.isError.value" />
        <SalesSkeleton v-else-if="result.isPending.value" />
        <SalesTable v-else :carts="result.data.value?.carts ?? []" />
      </CardBody>
    </Card>
  </div>
</template>
