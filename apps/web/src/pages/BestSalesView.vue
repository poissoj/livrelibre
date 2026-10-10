<script setup lang="ts">
import { formatNumber } from "@livrelibre/shared/format";
import { useQuery } from "@tanstack/vue-query";
import { clsx } from "clsx";
import { RouterLink } from "vue-router";

import AppCard from "@/components/AppCard.vue";
import AppSkeleton from "@/components/AppSkeleton.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import { trpcClient } from "@/utils/trpc";

const TH_STYLES = "sticky top-0 bg-white";

const {
  data: bestSales,
  isPending,
  isError,
  refetch,
} = useQuery({
  queryKey: ["bestsales"],
  queryFn: () => trpcClient.bestsales.query(),
});
</script>

<template>
  <div class="[margin-left:10%] [margin-right:10%] flex flex-1 flex-col gap-lg">
    <AppCard class="max-h-full overflow-hidden flex flex-col">
      <CardTitle :level="1">Meilleures ventes</CardTitle>
      <CardBody>
        <ErrorMessage v-if="isError" :on-retry="refetch" />
        <AppSkeleton v-else-if="isPending" :height="500">
          <template v-for="n in 17" :key="n">
            <rect x="2%" :y="(n - 1) * 30 + 10" width="3%" :height="10" rx="5" />
            <rect x="10%" :y="(n - 1) * 30 + 10" width="40%" :height="10" />
            <rect x="60%" :y="(n - 1) * 30 + 10" width="20%" :height="10" />
            <rect x="83%" :y="(n - 1) * 30 + 10" width="6%" :height="10" rx="5" />
            <rect x="92%" :y="(n - 1) * 30 + 10" width="6%" :height="10" rx="5" />
          </template>
        </AppSkeleton>
        <table v-else class="flex-1 [border-collapse:separate] [border-spacing:2px_0.5rem]">
          <caption class="sr-only">
            Meilleures ventes
          </caption>
          <thead>
            <tr>
              <th scope="col" :class="clsx(TH_STYLES, 'text-left')">#</th>
              <th scope="col" :class="clsx(TH_STYLES, 'text-left')">Titre</th>
              <th scope="col" :class="clsx(TH_STYLES, 'text-left')">Auteur·ice</th>
              <th scope="col" :class="clsx(TH_STYLES, 'text-right')">Vendus</th>
              <th scope="col" :class="clsx(TH_STYLES, 'text-right whitespace-nowrap')">En stock</th>
              <th scope="col" :class="TH_STYLES">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in bestSales ?? []" :key="item.id">
              <td>{{ i + 1 }}</td>
              <td>
                <span class="text-primary-darkest">
                  <RouterLink :to="`/item/${String(item.id)}`">
                    {{ item.title }}
                  </RouterLink>
                </span>
              </td>
              <td>{{ item.author }}</td>
              <td class="text-right font-number">
                {{ formatNumber(Number(item.count)) }}
              </td>
              <td class="pr-3 text-right font-number">
                {{ formatNumber(item.amount) }}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </CardBody>
    </AppCard>
  </div>
</template>
