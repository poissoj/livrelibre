<script setup lang="ts">
import { defineAsyncComponent } from "vue";

import Card from "@/components/Card.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import Skeleton from "@/components/Skeleton.vue";
import { useTRPCQuery } from "@/utils/query";

const SalesByMonth = defineAsyncComponent(
  () => import("@/components/Charts/SalesByMonth.vue"),
);

const props = defineProps<{ id: number }>();

const { data: sales, isPending, isError } = useTRPCQuery("lastSales", props.id);
</script>

<template>
  <Card class="mb-lg">
    <CardTitle>Ventes des 2 dernières années</CardTitle>
    <CardBody>
      <ErrorMessage v-if="isError" />
      <Skeleton v-else-if="isPending" :height="350">
        <rect x="2%" y="119" width="4%" height="196" />
        <rect x="8%" y="83" width="4%" height="232" />
        <rect x="26%" y="160" width="4%" height="155" />
        <rect x="50%" y="238" width="4%" height="77" />
        <rect x="74%" y="276" width="4%" height="39" />
        <rect x="80%" y="119" width="4%" height="196" />
        <rect x="86%" y="109" width="4%" height="206" />
        <rect x="92%" y="160" width="4%" height="155" />
      </Skeleton>
      <SalesByMonth v-else :sales="sales ?? []" />
    </CardBody>
  </Card>
</template>
