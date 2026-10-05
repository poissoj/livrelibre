<script setup lang="ts">
import {
  faCartPlus,
  faShoppingCart,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed } from "vue";

import type { Bookmark } from "@livrelibre/server/server/bookmarks";

import { useAddToCart } from "@/utils/useAddToCart";

const props = defineProps<{ item: Bookmark }>();

const { mutate, isPending } = useAddToCart();

const icon = computed(() => {
  if (isPending.value) return faSpinner;
  return props.item.amount > 0 ? faCartPlus : faShoppingCart;
});
</script>

<template>
  <button
    class="p-xs mr-xs disabled:(cursor-not-allowed opacity-80) hover:text-primary-darkest"
    aria-label="Ajouter au panier"
    title="Ajouter au panier"
    type="button"
    :disabled="props.item.amount === 0"
    @click="mutate({ id: props.item.id })"
  >
    <FontAwesomeIcon :icon="icon" :spin="isPending" />
  </button>
</template>
