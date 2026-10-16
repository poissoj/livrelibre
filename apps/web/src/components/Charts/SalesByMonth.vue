<script setup lang="ts">
import { computed } from "vue";

import BarChart from "@/components/Charts/BarChart.vue";
import type { RouterOutput } from "@/utils/trpc";

const props = defineProps<{ sales: RouterOutput["lastSales"] }>();

const items = computed(() =>
  props.sales.map((sale) => ({
    label: sale.monthLabel,
    value: sale.count,
    title: `${sale.fullMonthLabel} · ${String(sale.count)} ventes`,
  })),
);
</script>

<template>
  <BarChart :items="items" :height="350" caption="Répartition mensuelle des ventes" />
</template>
