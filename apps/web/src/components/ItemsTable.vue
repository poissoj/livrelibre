<script setup lang="ts">
import { formatNumber } from "@livrelibre/shared/format";
import type { Item } from "@livrelibre/shared/item";
import { RouterLink } from "vue-router";

import AddToCartButton from "./AddToCartButton.vue";

const props = defineProps<{ items: Item[] }>();
</script>

<template>
  <table class="flex-1 border-separate [border-spacing:2px_0.5rem]">
    <caption class="sr-only">
      Liste des articles
    </caption>
    <thead>
      <tr class="sticky top-0 bg-white z-10">
        <th scope="col" class="text-left">Distributeur</th>
        <th scope="col" class="text-left">Titre</th>
        <th scope="col" class="text-left">Auteur·ice</th>
        <th scope="col" class="text-right">Quantité</th>
        <th scope="col"><span class="sr-only">Actions</span></th>
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
