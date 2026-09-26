<script setup lang="ts">
import { clsx } from "clsx";
import { computed } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";

import { formatPrice } from "@livrelibre/shared/format";
import { ITEM_TYPES } from "@livrelibre/shared/item";

import Card from "@/components/Card.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import CategoriesTable from "@/components/PaymentStats/CategoriesTable.vue";
import CategorySkeleton from "@/components/PaymentStats/CategorySkeleton.vue";
import Restricted from "@/components/Restricted.vue";
import Skeleton from "@/components/Skeleton.vue";
import StatsByTVA from "@/components/TVAStats/StatsByTVA.vue";
import TVASkeleton from "@/components/TVAStats/TVASkeleton.vue";
import { useTRPCQuery } from "@/utils/query";

const TH_STYLES = "sticky top-0 bg-white";

const route = useRoute();
const router = useRouter();

const year = computed(() => String(route.params.year));
const month = computed(() => String(route.params.month));
const params = computed(() => ({ month: month.value, year: year.value }));

const {
  data: monthStats,
  isPending,
  isError,
} = useTRPCQuery("salesByMonth", params);

const formatDate = (date: string) => date.split("-").reverse().join("/");
const makeSaleURL = (date: string) => `/sale/${date.split("-").join("/")}`;
const goToSale = (date: string) => {
  void router.push(makeSaleURL(date));
};

const monthLabel = computed(() =>
  new Date(Number(year.value), Number(month.value) - 1).toLocaleDateString(
    "fr",
    { month: "long", year: "numeric" },
  ),
);
const categories = computed(() =>
  (monthStats.value?.itemTypes ?? []).map((item) => ({
    ...item,
    label: ITEM_TYPES[item.itemType],
  })),
);
</script>

<template>
  <Restricted role="admin">
    <div class="flex items-start gap-lg flex-1 flex-wrap">
      <Card class="flex flex-col flex-1 max-h-full overflow-hidden">
        <CardTitle>Liste des ventes - {{ monthLabel }}</CardTitle>
        <CardBody>
          <ErrorMessage v-if="isError" />
          <Skeleton v-else-if="isPending" :height="600">
            <template v-for="n in 20" :key="n">
              <rect
                x="5%"
                :y="(n - 1) * 30 + 15"
                rx="2"
                ry="2"
                width="19%"
                height="10"
              />
              <rect
                x="27%"
                :y="(n - 1) * 30 + 15"
                rx="2"
                ry="2"
                width="19%"
                height="10"
              />
              <rect
                x="49%"
                :y="(n - 1) * 30 + 15"
                rx="2"
                ry="2"
                width="19%"
                height="10"
              />
              <rect
                x="71%"
                :y="(n - 1) * 30 + 13"
                rx="2"
                ry="2"
                width="19%"
                height="14"
              />
            </template>
          </Skeleton>
          <table v-else class="flex-1">
            <thead>
              <tr>
                <th :class="clsx(TH_STYLES, 'text-left pl-2')">Jour</th>
                <th :class="clsx(TH_STYLES, 'text-right')">Nombre de ventes</th>
                <th :class="clsx(TH_STYLES, 'text-right')">Recette totale</th>
              </tr>
            </thead>
            <tbody class="[line-height:2.3rem]">
              <tr
                v-for="(sale, i) in monthStats?.salesByDay ?? []"
                :key="i"
                class="cursor-pointer hover:bg-gray-light"
                @click="goToSale(sale.date)"
              >
                <td class="pl-2">
                  <RouterLink :to="makeSaleURL(sale.date)">
                    {{ formatDate(sale.date) }}
                  </RouterLink>
                </td>
                <td class="text-right font-number">{{ sale.count }}</td>
                <td class="text-right font-number pr-2">
                  {{ formatPrice(Number(sale.total)) }}
                </td>
              </tr>
            </tbody>
          </table>
        </CardBody>
      </Card>
      <div class="flex flex-col gap-lg flex-1 max-h-full">
        <Card class="[min-height:12rem] flex flex-col">
          <CardTitle>Répartition par TVA</CardTitle>
          <CardBody>
            <ErrorMessage v-if="isError" />
            <TVASkeleton v-else-if="isPending" />
            <StatsByTVA v-else :stats="monthStats?.stats ?? []" />
          </CardBody>
        </Card>
        <Card>
          <CardTitle>Répartition par catégorie</CardTitle>
          <CardBody>
            <ErrorMessage v-if="isError" />
            <CategorySkeleton v-else-if="isPending" />
            <CategoriesTable v-else :categories="categories" />
          </CardBody>
        </Card>
      </div>
    </div>
  </Restricted>
</template>
