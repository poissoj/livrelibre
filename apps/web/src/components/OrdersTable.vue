<script setup lang="ts">
import { computed } from "vue";

import type { OrderRow } from "@livrelibre/shared/order";

import { useQueryParams } from "@/utils/useQueryParams";

import OrderRowCmp from "./orders/OrderRow.vue";
import OrderTableHead from "./orders/OrderTableHead.vue";
import { DEFAULT_SORTBY, sortOrders } from "./orders/sort";

const props = defineProps<{ items: OrderRow[] }>();

const { query } = useQueryParams();
const sortBy = computed(() =>
  typeof query.value.sortBy === "string" ? query.value.sortBy : DEFAULT_SORTBY,
);
const sortedItems = computed(() =>
  props.items.toSorted(sortOrders(sortBy.value)),
);
</script>

<template>
  <table class="flex-1 text-sm">
    <caption class="sr-only">
      Liste des commandes
    </caption>
    <OrderTableHead />
    <tbody class="leading-7">
      <OrderRowCmp
        v-for="item in sortedItems"
        :key="item.id"
        :item="item"
        class="even:bg-gray-light"
      />
    </tbody>
  </table>
</template>
