<script setup lang="ts">
import { computed } from "vue";

import BarChart from "@/components/Charts/BarChart.vue";

const props = defineProps<{
  days: Array<{ name: string; count: number }>;
}>();

const items = computed(() => props.days.map((day) => ({ label: day.name, value: day.count })));
</script>

<template>
  <BarChart :items="items" :height="300" caption="Répartition quotidienne des ventes" />
</template>
