<script setup lang="ts">
import { clsx } from "clsx";
import { RouterLink, useRouter } from "vue-router";

import type { Sale } from "@livrelibre/server/server/sales";
import { formatNumber, formatPrice } from "@livrelibre/shared/format";

import Card from "@/components/Card.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import Restricted from "@/components/Restricted.vue";
import Skeleton from "@/components/Skeleton.vue";
import { useTRPCQuery } from "@/utils/query";

const TH_STYLES = "sticky top-0 bg-white";

const router = useRouter();
const { data: sales, isPending, isError } = useTRPCQuery("sales", undefined);

const makeSaleURL = (sale: Sale) =>
  `/sale/${sale.month.split("/").reverse().join("/")}`;
const goToSale = (sale: Sale) => {
  void router.push(makeSaleURL(sale));
};
</script>

<template>
  <Restricted role="admin">
    <div class="[margin-left:10%] [margin-right:10%] flex-1">
      <Card class="mb-lg max-h-full overflow-hidden flex flex-col">
        <CardTitle>Liste des ventes par mois</CardTitle>
        <CardBody>
          <ErrorMessage v-if="isError" />
          <Skeleton v-else-if="isPending" :height="380">
            <template v-for="n in 12" :key="n">
              <rect
                x="5%"
                :y="(n - 1) * 30 + 15"
                rx="2"
                ry="2"
                width="15%"
                height="10"
              />
              <rect
                x="23%"
                :y="(n - 1) * 30 + 15"
                rx="2"
                ry="2"
                width="15%"
                height="10"
              />
              <rect
                x="41%"
                :y="(n - 1) * 30 + 15"
                rx="2"
                ry="2"
                width="15%"
                height="10"
              />
              <rect
                x="59%"
                :y="(n - 1) * 30 + 15"
                rx="2"
                ry="2"
                width="15%"
                height="10"
              />
              <rect
                x="77%"
                :y="(n - 1) * 30 + 16"
                rx="2"
                ry="2"
                width="15%"
                height="12"
              />
            </template>
          </Skeleton>
          <table v-else class="flex-1">
            <thead>
              <tr>
                <th :class="clsx(TH_STYLES, 'text-left pl-2')">Mois</th>
                <th :class="clsx(TH_STYLES, 'text-right')">Nombre de ventes</th>
                <th :class="clsx(TH_STYLES, 'text-right')">
                  Recette totale HT
                </th>
                <th :class="clsx(TH_STYLES, 'text-right')">
                  Recette totale TTC
                </th>
                <th :class="clsx(TH_STYLES, 'text-right pr-1')">
                  Panier moyen
                </th>
              </tr>
            </thead>
            <tbody class="[line-height:2.3rem]">
              <tr
                v-for="(sale, i) in sales ?? []"
                :key="i"
                class="cursor-pointer hover:bg-gray-light"
                @click="goToSale(sale)"
              >
                <td class="pl-2">
                  <RouterLink :to="makeSaleURL(sale)">{{
                    sale.month
                  }}</RouterLink>
                </td>
                <td class="text-right font-number">
                  {{ formatNumber(sale.count) }}
                </td>
                <td class="text-right font-number">
                  {{ formatPrice(sale.ht) }}
                </td>
                <td class="text-right font-number">
                  {{ formatPrice(sale.amount) }}
                </td>
                <td class="text-right font-number pr-2">
                  {{ formatPrice(sale.avg) }}
                </td>
              </tr>
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  </Restricted>
</template>
