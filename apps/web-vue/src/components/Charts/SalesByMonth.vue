<script setup lang="ts">
import type {
  DefaultLabelFormatterCallbackParams,
  EChartsOption,
  TooltipComponentFormatterCallbackParams,
} from "echarts";
import { BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { computed } from "vue";
import VChart from "vue-echarts";

import type { RouterOutput } from "@/utils/trpc";

use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

const props = defineProps<{ sales: RouterOutput["lastSales"] }>();

const option = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: "axis",
    formatter: (params: TooltipComponentFormatterCallbackParams) => {
      const list = Array.isArray(params) ? params : [params];
      const sale = props.sales[list[0].dataIndex];
      return `${sale.fullMonthLabel}<br/>${String(sale.count)} ventes`;
    },
  },
  grid: { top: 0, bottom: 0, left: 0, right: 0, containLabel: true },
  xAxis: { type: "category", data: props.sales.map((sale) => sale.monthLabel) },
  yAxis: { type: "value", show: false },
  series: [
    {
      type: "bar",
      data: props.sales.map((sale) => sale.count),
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
  <div class="h-[350px] w-full">
    <VChart :option="option" autoresize />
  </div>
</template>
