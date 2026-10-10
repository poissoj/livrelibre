<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { defineAsyncComponent } from "vue";

import AppCard from "@/components/AppCard.vue";
import AppSkeleton from "@/components/AppSkeleton.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import { trpcClient } from "@/utils/trpc";

const props = defineProps<{ id: number }>();

const SalesByMonth = defineAsyncComponent(() => import("@/components/Charts/SalesByMonth.vue"));

const {
  data: sales,
  isPending,
  isError,
  refetch,
} = useQuery({
  queryKey: ["lastSales", () => props.id],
  queryFn: () => trpcClient.lastSales.query(props.id),
});
</script>

<template>
  <AppCard class="mb-lg">
    <CardTitle>Ventes des 2 dernières années</CardTitle>
    <CardBody>
      <ErrorMessage v-if="isError" :on-retry="refetch" />
      <AppSkeleton v-else-if="isPending" :height="350">
        <rect x="2%" y="119" width="4%" height="196" />
        <rect x="8%" y="83" width="4%" height="232" />
        <rect x="26%" y="160" width="4%" height="155" />
        <rect x="50%" y="238" width="4%" height="77" />
        <rect x="74%" y="276" width="4%" height="39" />
        <rect x="80%" y="119" width="4%" height="196" />
        <rect x="86%" y="109" width="4%" height="206" />
        <rect x="92%" y="160" width="4%" height="155" />
      </AppSkeleton>
      <SalesByMonth v-else :sales="sales ?? []" />
    </CardBody>
  </AppCard>
</template>
