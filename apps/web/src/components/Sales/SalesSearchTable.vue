<script setup lang="ts">
import { formatPrice, formatTVA } from "@livrelibre/shared/format";
import { PAYMENT_METHODS } from "@livrelibre/shared/sale";
import { clsx } from "clsx";
import { RouterLink } from "vue-router";

import type { RouterOutput } from "@/utils/trpc";

type Sales = RouterOutput["searchSales"]["sales"];

const props = defineProps<{ sales: Sales }>();

const TH_STYLES = "sticky top-0 bg-white";

const makeDayURL = (date: string) => `/sale/${date.split("-").join("/")}`;
const formatDate = (date: string) => date.split("-").reverse().join("/");
</script>

<template>
  <table class="flex-1" cellpadding="8">
    <caption class="sr-only">
      Résultats de la recherche de ventes
    </caption>
    <thead>
      <tr>
        <th scope="col" :class="clsx(TH_STYLES, 'text-left pl-sm')">Date</th>
        <th scope="col" :class="clsx(TH_STYLES, 'text-left pl-sm')">Titre</th>
        <th scope="col" :class="clsx(TH_STYLES, 'text-left pl-sm')">Auteur·ice</th>
        <th scope="col" :class="clsx(TH_STYLES, 'text-right pr-sm')">Quantité</th>
        <th scope="col" :class="clsx(TH_STYLES, 'text-right pr-sm')">Prix total</th>
        <th scope="col" :class="clsx(TH_STYLES, 'text-right pr-sm')">TVA</th>
        <th scope="col" :class="clsx(TH_STYLES, 'text-left pl-sm')">Paiement</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="sale in props.sales"
        :key="sale.id"
        :class="clsx(sale.deleted && 'line-through italic')"
      >
        <td class="p-sm">
          <RouterLink :to="makeDayURL(sale.date)" class="text-primary-darkest">
            {{ formatDate(sale.date) }}
          </RouterLink>
        </td>
        <td class="p-sm">
          <RouterLink
            v-if="sale.itemId"
            :to="`/item/${String(sale.itemId)}`"
            class="text-primary-darkest"
          >
            {{ sale.title }}
          </RouterLink>
          <template v-else>{{ sale.title }}</template>
        </td>
        <td class="p-sm">{{ sale.author ?? "" }}</td>
        <td class="p-sm text-right font-number">{{ sale.quantity }}</td>
        <td class="p-sm text-right font-number">{{ formatPrice(sale.price) }}</td>
        <td class="p-sm text-right font-number">{{ formatTVA(sale.tva) }}</td>
        <td class="p-sm">{{ PAYMENT_METHODS[sale.paymentType] }}</td>
      </tr>
    </tbody>
  </table>
</template>
