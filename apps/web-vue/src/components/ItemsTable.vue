<script setup lang="ts">
import { RouterLink } from "vue-router";

import { formatNumber } from "@livrelibre/shared/format";
import type { Item } from "@livrelibre/shared/item";

import AddToCartButton from "./AddToCartButton.vue";

const props = defineProps<{ items: Item[] }>();
</script>

<template>
  <table class="flex-1 border-separate [border-spacing:2px_0.5rem]">
    <thead>
      <tr class="sticky top-0 bg-white z-10">
        <th class="text-left">Distributeur</th>
        <th class="text-left">Titre</th>
        <th class="text-left">Auteur·ice</th>
        <th class="text-right">Quantité</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in props.items" :key="item.id">
        <td>{{ item.distributor }}</td>
        <td>
          <span class="text-primary-darkest">
            <RouterLink :to="`/item/${String(item.id)}`">
              {{ item.title }}
            </RouterLink>
          </span>
        </td>
        <td>{{ item.author }}</td>
        <td class="text-right font-number pr-2">
          {{ formatNumber(item.amount) }}
        </td>
        <td class="text-primary-darker">
          <AddToCartButton :item="item" class="px-3" />
        </td>
      </tr>
    </tbody>
  </table>
</template>
