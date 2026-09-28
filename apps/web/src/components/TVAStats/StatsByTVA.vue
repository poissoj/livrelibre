<script setup lang="ts">
import { clsx } from "clsx";

import {
  formatNumber,
  formatPrice,
  formatTVA,
} from "@livrelibre/shared/format";
import { PAYMENT_METHODS } from "@livrelibre/shared/sale";

import type { RouterOutput } from "@/utils/trpc";

type TStats = RouterOutput["salesByMonth"]["stats"];

defineProps<{ stats: TStats }>();

const TH_STYLES = "sticky top-0 bg-white";
</script>

<template>
  <table class="flex-1">
    <thead>
      <tr>
        <th :class="clsx(TH_STYLES, 'text-left')">Type de paiement</th>
        <th :class="clsx(TH_STYLES, 'text-right')">TVA</th>
        <th :class="clsx(TH_STYLES, 'text-right')">Quantité</th>
        <th :class="clsx(TH_STYLES, 'text-right')">Total</th>
      </tr>
    </thead>
    <tbody class="[line-height:1.9rem]">
      <tr v-for="(stat, i) in stats" :key="i">
        <td>{{ PAYMENT_METHODS[stat.paymentType] }}</td>
        <td class="text-right font-number">{{ formatTVA(stat.tva) }}</td>
        <td class="text-right font-number">{{ formatNumber(stat.nb) }}</td>
        <td class="text-right font-number">
          {{ formatPrice(Number(stat.total)) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
