<script setup lang="ts">
import { computed } from "vue";
import { ContentLoader } from "vue-content-loader";

import Card from "@/components/Card.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import SalesByDay from "@/components/Charts/SalesByDay.vue";
import SalesByHour from "@/components/Charts/SalesByHour.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import Title from "@/components/Title.vue";
import { useTRPCQuery } from "@/utils/query";

const DAYS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

const result = useTRPCQuery("stats", undefined);

const days = computed(() =>
  (result.data.value?.days ?? []).map(({ day, count }) => ({
    name: DAYS[day] ?? "",
    count,
  })),
);
</script>

<template>
  <div class="flex flex-1 flex-col gap-lg items-center">
    <Title>Statistiques</Title>
    <Card>
      <CardTitle>Nombre de ventes par heure</CardTitle>
      <CardBody class="[width:900px]">
        <ErrorMessage v-if="result.isError.value" />
        <ContentLoader
          v-else-if="result.isPending.value"
          viewBox="0 0 900 320"
          :width="900"
          :height="320"
        >
          <rect :x="84" :y="257" :width="53" :height="33" />
          <rect :x="151" :y="137" :width="53" :height="153" />
          <rect :x="218" :y="3" :width="53" :height="287" />
          <rect :x="286" :y="60" :width="53" :height="230" />
          <rect :x="353" :y="251" :width="53" :height="39" />
          <rect :x="420" :y="201" :width="53" :height="89" />
          <rect :x="488" :y="131" :width="53" :height="159" />
          <rect :x="555" :y="104" :width="53" :height="186" />
          <rect :x="622" :y="115" :width="53" :height="175" />
          <rect :x="690" :y="150" :width="53" :height="140" />
          <rect :x="757" :y="256" :width="53" :height="34" />
        </ContentLoader>
        <SalesByHour v-else :hours="result.data.value?.hours ?? []" />
      </CardBody>
    </Card>
    <Card>
      <CardTitle>Nombre de ventes par jour</CardTitle>
      <CardBody class="[width:900px] justify-center">
        <ErrorMessage v-if="result.isError.value" />
        <ContentLoader
          v-else-if="result.isPending.value"
          viewBox="0 0 800 300"
          :width="800"
          :height="300"
        >
          <rect :x="16" :y="11" :width="90" :height="254" />
          <rect :x="129" :y="217" :width="90" :height="48" />
          <rect :x="242" :y="121" :width="90" :height="144" />
          <rect :x="355" :y="118" :width="90" :height="147" />
          <rect :x="468" :y="124" :width="90" :height="141" />
          <rect :x="581" :y="101" :width="90" :height="164" />
          <rect :x="693" :y="81" :width="90" :height="184" />
        </ContentLoader>
        <SalesByDay v-else :days="days" />
      </CardBody>
    </Card>
    <div class="w-1 h-1 shrink-0" />
  </div>
</template>
