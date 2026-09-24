<script setup lang="ts">
import { useRouter } from "vue-router";

import type { CustomerWithTotal } from "@livrelibre/shared/customer";
import { formatPrice } from "@livrelibre/shared/format";

const props = defineProps<{ items: CustomerWithTotal[] }>();

const router = useRouter();
const goToCustomer = (id: number) => {
  void router.push(`/customer/${String(id)}`);
};
</script>

<template>
  <table class="flex-1">
    <thead>
      <tr class="sticky top-0 bg-white z-10">
        <th class="text-left">Nom</th>
        <th class="text-left w-32">Téléphone</th>
        <th class="text-left">Mail</th>
        <th class="text-left">Remarque contact</th>
        <th class="text-left">Commentaire</th>
        <th class="text-right">Remise</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody class="leading-7">
      <tr
        v-for="item in props.items"
        :key="item.id"
        class="cursor-pointer hover:bg-gray-light"
        @click="goToCustomer(item.id)"
      >
        <td>{{ item.fullname }}</td>
        <td class="whitespace-nowrap">{{ item.phone }}</td>
        <td>{{ item.email }}</td>
        <td>{{ item.contact }}</td>
        <td>{{ item.comment }}</td>
        <td class="text-right font-number pr-2">
          {{ formatPrice(Math.round(Number(item.total) * 3) / 100) }}
        </td>
        <td class="text-right font-number pr-2">
          {{ formatPrice(Number(item.total)) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
