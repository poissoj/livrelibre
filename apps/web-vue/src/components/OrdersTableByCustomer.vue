<script setup lang="ts">
import { computed } from "vue";

import type { CustomerOrders } from "@livrelibre/shared/order";

import { useQueryParams } from "@/utils/useQueryParams";

import OrderRowCmp from "./orders/OrderRow.vue";
import OrderTableHead from "./orders/OrderTableHead.vue";
import { DEFAULT_SORTBY, sortGroups } from "./orders/sort";

const props = defineProps<{ items: CustomerOrders[] }>();

const { query } = useQueryParams();
const sortBy = computed(() =>
  typeof query.value.sortBy === "string" ? query.value.sortBy : DEFAULT_SORTBY,
);
const sortedItems = computed(() =>
  props.items.toSorted(sortGroups(sortBy.value)),
);
</script>

<template>
  <table class="flex-1 text-sm">
    <OrderTableHead group />
    <tbody
      v-for="row in sortedItems"
      :key="row.customer.name"
      class="leading-7 odd:bg-gray-light"
    >
      <OrderRowCmp
        v-for="item in row.orders"
        :key="item.id"
        :item="{ ...item, customerName: row.customer.name, ...row.customer }"
      />
    </tbody>
  </table>
</template>
