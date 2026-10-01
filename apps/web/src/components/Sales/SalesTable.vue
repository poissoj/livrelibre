<script setup lang="ts">
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { clsx } from "clsx";
import { RouterLink } from "vue-router";

import {
  formatNumber,
  formatPrice,
  formatTVA,
} from "@livrelibre/shared/format";
import { PAYMENT_METHODS } from "@livrelibre/shared/sale";

import type { RouterOutput } from "@/utils/trpc";

import DeleteSale from "./DeleteSale.vue";

type Carts = RouterOutput["salesByDay"]["carts"];
type Sale = Carts[number]["sales"][number];

const props = defineProps<{ carts: Carts }>();

const TH_STYLES = "sticky top-0 bg-white";

const saleAmount = (sale: Sale) => ("amount" in sale ? sale.amount : undefined);
const saleAuthor = (sale: Sale) => ("author" in sale ? sale.author : undefined);
const saleLinked = (sale: Sale) =>
  "linkedToCustomer" in sale ? sale.linkedToCustomer : false;
</script>

<template>
  <table class="flex-1" cellpadding="8">
    <thead>
      <tr>
        <th :class="clsx(TH_STYLES, 'text-right')">Stock</th>
        <th :class="clsx(TH_STYLES, 'text-left')">Titre</th>
        <th :class="clsx(TH_STYLES, 'text-left')">Auteur·ice</th>
        <th :class="clsx(TH_STYLES, 'text-right')">Quantité</th>
        <th :class="clsx(TH_STYLES, 'text-right')">Prix total</th>
        <th :class="clsx(TH_STYLES, 'text-right')">Panier</th>
        <th :class="clsx(TH_STYLES, 'text-right')">TVA</th>
        <th :class="clsx(TH_STYLES, 'text-left')">Paiement</th>
        <th :class="clsx(TH_STYLES, 'w-8')"></th>
        <th :class="clsx(TH_STYLES, 'w-10')"></th>
      </tr>
    </thead>
    <tbody v-for="(cart, i) in props.carts" :key="i" class="odd:bg-gray-light">
      <tr
        v-for="(sale, index) in cart.sales"
        :key="sale.id"
        :class="clsx(sale.deleted && 'line-through italic')"
      >
        <td class="p-sm text-right font-number">
          {{
            saleAmount(sale) !== undefined
              ? formatNumber(saleAmount(sale)!)
              : ""
          }}
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
        <td class="p-sm">{{ saleAuthor(sale) ?? "" }}</td>
        <td class="p-sm text-right font-number">{{ sale.quantity }}</td>
        <td class="p-sm text-right font-number">
          {{ formatPrice(sale.price) }}
        </td>
        <td class="p-sm text-right font-number">
          {{ index === cart.sales.length - 1 ? formatPrice(cart.total) : "" }}
        </td>
        <td class="p-sm text-right font-number">{{ formatTVA(sale.tva) }}</td>
        <td class="p-sm whitespace-nowrap">
          {{ PAYMENT_METHODS[sale.paymentType] }}
        </td>
        <td class="p-sm pr-3">
          <DeleteSale v-if="!sale.deleted" :sale-id="sale.id" />
        </td>
        <td v-if="index === 0" class="p-sm" :rowspan="cart.sales.length">
          <span
            v-if="saleLinked(sale)"
            title="Cette vente est associée à un⋅e client⋅e"
          >
            <FontAwesomeIcon :icon="faUser" />
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</template>
