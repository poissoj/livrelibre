<script setup lang="ts">
import {
  formatNumber,
  formatPrice,
  formatTVA,
} from "@livrelibre/shared/format";
import { ITEM_TYPES, type ItemWithCount } from "@livrelibre/shared/item";

import StatusCircle from "./StatusCircle.vue";
import type { ItemOrder } from "./item";

const props = defineProps<{
  item: ItemWithCount;
  orders: ItemOrder[] | undefined;
}>();

const formatStringPrice = (price: string) =>
  price ? formatPrice(Number(price)) : "";
</script>

<template>
  <dl class="flex flex-wrap min-w-[24rem]">
    <dt class="[flex-basis:30%] p-sm font-medium">Type</dt>
    <dd class="[flex:1_0_70%] p-sm">{{ ITEM_TYPES[props.item.type] }}</dd>
    <dt class="[flex-basis:30%] p-sm font-medium">ISBN</dt>
    <dd class="[flex:1_0_70%] p-sm">{{ props.item.isbn }}</dd>
    <dt class="[flex-basis:30%] p-sm font-medium">Auteur·ice</dt>
    <dd class="[flex:1_0_70%] p-sm">{{ props.item.author }}</dd>
    <dt class="[flex-basis:30%] p-sm font-medium">Titre</dt>
    <dd class="[flex:1_0_70%] p-sm">{{ props.item.title }}</dd>
    <dt class="[flex-basis:30%] p-sm font-medium">Maison d'édition</dt>
    <dd class="[flex:1_0_70%] p-sm">{{ props.item.publisher }}</dd>
    <dt class="[flex-basis:30%] p-sm font-medium">Distributeur</dt>
    <dd class="[flex:1_0_70%] p-sm">{{ props.item.distributor }}</dd>
    <dt class="[flex-basis:30%] p-sm font-medium">Mots-clés</dt>
    <dd class="[flex:1_0_70%] p-sm">{{ props.item.keywords }}</dd>
    <dt class="[flex-basis:30%] p-sm font-medium">Date d’achat</dt>
    <dd class="[flex:1_0_70%] p-sm">{{ props.item.datebought }}</dd>
    <dt class="[flex-basis:30%] p-sm font-medium">Commentaires</dt>
    <dd class="[flex:1_0_70%] p-sm">
      <pre>{{ props.item.comments }}</pre>
    </dd>
    <dt class="[flex-basis:30%] p-sm font-medium">Prix de vente</dt>
    <dd class="[flex:1_0_70%] p-sm font-number">
      {{ formatStringPrice(props.item.price) }}
    </dd>
    <dt class="[flex-basis:30%] p-sm font-medium">Quantité</dt>
    <dd class="[flex:1_0_70%] p-sm font-number">
      {{ formatNumber(props.item.amount) }}
    </dd>
    <dt class="[flex-basis:30%] p-sm font-medium">Commandes</dt>
    <dd class="[flex:1_0_70%] p-sm">
      <template v-if="props.orders">
        <span v-if="props.orders.length === 0">Aucune commande en cours</span>
        <div v-else class="flex gap-2">
          <div v-for="order in props.orders" :key="order.status" class="flex">
            <StatusCircle :status="order.status" class="mr-1" />:
            {{ order.count }}
          </div>
        </div>
      </template>
      <template v-else>Chargement…</template>
    </dd>
    <dt class="[flex-basis:30%] p-sm font-medium">TVA</dt>
    <dd class="[flex:1_0_70%] p-sm font-number">
      {{ formatTVA(props.item.tva) }}
    </dd>
    <dt class="[flex-basis:30%] p-sm font-medium">Vendu</dt>
    <dd class="[flex:1_0_70%] p-sm">
      <span class="font-number">{{ formatNumber(props.item.count) }}</span>
      fois
    </dd>
  </dl>
</template>
