<script setup lang="ts">
import type {
  DefaultLabelFormatterCallbackParams,
  EChartsOption,
} from "echarts";
import { BarChart } from "echarts/charts";
import { GridComponent } from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { computed } from "vue";
import VChart from "vue-echarts";

const props = defineProps<{
  days: Array<{ name: string; count: number }>;
}>();

use([BarChart, GridComponent, CanvasRenderer]);

const option = computed<EChartsOption>(() => ({
  grid: { top: 0, bottom: 0, left: 0, right: 0, containLabel: true },
  xAxis: { type: "category", data: props.days.map((day) => day.name) },
  yAxis: { type: "value", show: false },
  series: [
    {
      type: "bar",
      data: props.days.map((day) => day.count),
      itemStyle: { color: "steelblue" },
      cursor: "default",
      label: {
        show: true,
        position: "insideTop",
        color: "white",
        formatter: (params: DefaultLabelFormatterCallbackParams) =>
          typeof params.value === "number" && params.value !== 0
            ? String(params.value)
            : "",
      },
      animation: false,
    },
  ],
}));
</script>

<template>
  <div class="h-[300px] w-full">
    <VChart :option="option" autoresize />
  </div>
</template>
