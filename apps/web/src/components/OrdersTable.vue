<script setup lang="ts">
import type { OrderRow } from "@livrelibre/shared/order";

import OrderRowCmp from "./orders/OrderRow.vue";
import OrderTableHead from "./orders/OrderTableHead.vue";

defineProps<{ items: OrderRow[] }>();
</script>

<template>
  <table class="flex-1 text-sm">
    <caption class="sr-only">
      Liste des commandes
    </caption>
    <OrderTableHead />
    <tbody class="leading-7">
      <OrderRowCmp v-for="item in items" :key="item.id" :item="item" class="even:bg-gray-light" />
    </tbody>
  </table>
</template>
