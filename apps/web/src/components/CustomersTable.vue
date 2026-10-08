<script setup lang="ts">
import type { CustomerWithTotal } from "@livrelibre/shared/customer";
import { formatPrice } from "@livrelibre/shared/format";
import { loyaltyDiscount } from "@livrelibre/shared/sale";
import { RouterLink } from "vue-router";

const props = defineProps<{ items: CustomerWithTotal[] }>();
</script>

<template>
  <table class="flex-1">
    <caption class="sr-only">
      Liste des client⋅es
    </caption>
    <thead>
      <tr class="sticky top-0 bg-white z-10">
        <th scope="col" class="text-left">Nom</th>
        <th scope="col" class="text-left w-32">Téléphone</th>
        <th scope="col" class="text-left">Mail</th>
        <th scope="col" class="text-left">Remarque contact</th>
        <th scope="col" class="text-left">Commentaire</th>
        <th scope="col" class="text-right">Remise</th>
        <th scope="col" class="text-right">Total</th>
      </tr>
    </thead>
    <tbody class="leading-7">
      <tr
        v-for="item in props.items"
        :key="item.id"
        class="relative cursor-pointer hover:bg-gray-light"
      >
        <td>
          <RouterLink
            :to="`/customer/${String(item.id)}`"
            class="after:absolute after:inset-0 after:content-['']"
          >
            {{ item.fullname }}
          </RouterLink>
        </td>
        <td class="whitespace-nowrap">{{ item.phone }}</td>
        <td>{{ item.email }}</td>
        <td>{{ item.contact }}</td>
        <td>{{ item.comment }}</td>
        <td class="text-right font-number pr-2">
          {{ formatPrice(loyaltyDiscount(Number(item.total))) }}
        </td>
        <td class="text-right font-number pr-2">
          {{ formatPrice(Number(item.total)) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
