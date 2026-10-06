<script setup lang="ts">
import { clsx } from "clsx";
import { RouterLink } from "vue-router";

import { formatNumber, formatPrice } from "@livrelibre/shared/format";

import type { RouterOutput } from "@/utils/trpc";

import RemoveFromCartButton from "./RemoveFromCartButton.vue";

type CartItems = RouterOutput["cart"]["items"];

const props = defineProps<{ items: CartItems }>();

const TH_STYLES = "sticky top-0 bg-white";
</script>

<template>
  <table class="flex-1 border-separate [border-spacing:2px_0.5rem]">
    <caption class="sr-only">
      Contenu du panier
    </caption>
    <thead>
      <tr>
        <th scope="col" :class="clsx(TH_STYLES, 'text-left')">Article</th>
        <th scope="col" :class="clsx(TH_STYLES, 'text-right')">
          Prix unitaire
        </th>
        <th scope="col" :class="clsx(TH_STYLES, 'text-right')">Quantité</th>
        <th scope="col" :class="clsx(TH_STYLES, 'text-right')">Prix total</th>
        <th scope="col" :class="TH_STYLES">
          <span class="sr-only">Actions</span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in props.items" :key="item.id">
        <td>
          <span v-if="item.itemId" class="text-primary-darkest">
            <RouterLink :to="`/item/${String(item.itemId)}`">
              {{ item.title }}
            </RouterLink>
          </span>
          <span v-else>{{ item.title }}</span>
        </td>
        <td class="text-right font-number">
          {{ formatPrice(Number(item.price)) }}
        </td>
        <td class="text-right font-number">
          {{ formatNumber(item.quantity) }}
        </td>
        <td class="text-right font-number">
          {{ formatPrice(Number(item.price) * item.quantity) }}
        </td>
        <td class="text-center">
          <RemoveFromCartButton :id="item.id" />
        </td>
      </tr>
    </tbody>
  </table>
</template>
