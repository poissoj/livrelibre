<script setup lang="ts">
import type { CustomerWithPurchase } from "@livrelibre/shared/customer";
import { formatISODateFR } from "@livrelibre/shared/date";
import { formatPrice } from "@livrelibre/shared/format";

defineProps<{ purchases: CustomerWithPurchase["purchases"] }>();
</script>

<template>
  <table class="w-fit border-separate border-spacing-x-4 border-spacing-y-1">
    <caption class="sr-only">
      Achats du client
    </caption>
    <thead>
      <tr>
        <th scope="col" class="text-left">Date</th>
        <th scope="col" class="text-right">Montant</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(purchase, i) in purchases" :key="i">
        <td>{{ formatISODateFR(purchase.date) }}</td>
        <td class="text-right font-number">
          {{ formatPrice(purchase.amount) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
