<script setup lang="ts">
import { clsx } from "clsx";

import { formatNumber } from "@livrelibre/shared/format";

import Card from "@/components/Card.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import Skeleton from "@/components/Skeleton.vue";
import Title from "@/components/Title.vue";
import { useTRPCQuery } from "@/utils/query";

const TH_STYLES = "sticky top-0 bg-white";

const {
  data: bestSales,
  isPending,
  isError,
} = useTRPCQuery("bestsales", undefined);
</script>

<template>
  <div class="[margin-left:10%] [margin-right:10%] flex flex-1 flex-col gap-lg">
    <Title>Meilleurs ventes</Title>
    <Card class="max-h-full overflow-hidden flex flex-col">
      <CardTitle>Meilleures ventes</CardTitle>
      <CardBody>
        <ErrorMessage v-if="isError" />
        <Skeleton v-else-if="isPending" :height="500">
          <template v-for="n in 17" :key="n">
            <rect
              x="2%"
              :y="(n - 1) * 30 + 10"
              width="3%"
              :height="10"
              rx="5"
            />
            <rect x="10%" :y="(n - 1) * 30 + 10" width="40%" :height="10" />
            <rect x="60%" :y="(n - 1) * 30 + 10" width="20%" :height="10" />
            <rect
              x="83%"
              :y="(n - 1) * 30 + 10"
              width="6%"
              :height="10"
              rx="5"
            />
            <rect
              x="92%"
              :y="(n - 1) * 30 + 10"
              width="6%"
              :height="10"
              rx="5"
            />
          </template>
        </Skeleton>
        <table
          v-else
          class="flex-1 [border-collapse:separate] [border-spacing:2px_0.5rem]"
        >
          <thead>
            <tr>
              <th :class="clsx(TH_STYLES, 'text-left')">#</th>
              <th :class="clsx(TH_STYLES, 'text-left')">Titre</th>
              <th :class="clsx(TH_STYLES, 'text-left')">Auteur·ice</th>
              <th :class="clsx(TH_STYLES, 'text-right')">Vendus</th>
              <th :class="clsx(TH_STYLES, 'text-right whitespace-nowrap')">
                En stock
              </th>
              <th :class="TH_STYLES"></th>
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
    </Card>
  </div>
</template>
