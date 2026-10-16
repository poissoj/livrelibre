<script setup lang="ts">
import { computed } from "vue";

import BarChart from "@/components/Charts/BarChart.vue";

const props = defineProps<{
  hours: Array<{ hour: number; count: number }>;
}>();

const items = computed(() =>
  props.hours.map((entry) => ({ label: `${String(entry.hour)}h`, value: entry.count })),
);
</script>

<template>
  <BarChart :items="items" :height="320" caption="Répartition horaire des ventes" />
</template>
