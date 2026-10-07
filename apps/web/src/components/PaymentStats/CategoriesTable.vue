<script setup lang="ts">
import { formatNumber, formatPrice } from "@livrelibre/shared/format";
import { clsx } from "clsx";

type Category = { label: string; nb: number; total: string | null };

defineProps<{ categories: Category[] }>();

const COMMON_TH_STYLES = "sticky top-0 bg-white";
</script>

<template>
  <table class="flex-1">
    <caption class="sr-only">
      Ventes par catégorie
    </caption>
    <thead>
      <tr>
        <th scope="col" :class="clsx(COMMON_TH_STYLES, 'text-left')">Catégorie</th>
        <th scope="col" :class="clsx(COMMON_TH_STYLES, 'text-right')">Quantité</th>
        <th scope="col" :class="clsx(COMMON_TH_STYLES, 'text-right')">Total</th>
      </tr>
    </thead>
    <tbody class="[line-height:1.9rem]">
      <tr v-for="category in categories" :key="category.label">
        <td>{{ category.label }}</td>
        <td class="text-right font-number">{{ formatNumber(category.nb) }}</td>
        <td class="text-right font-number">
          {{ formatPrice(Number(category.total)) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
