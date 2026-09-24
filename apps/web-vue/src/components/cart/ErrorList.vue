<script setup lang="ts">
import { RouterLink } from "vue-router";

import { CART_ERRORS } from "@livrelibre/shared/errors";

import Alert from "@/components/Alert.vue";

import type { ISBNError } from "./types";

const props = defineProps<{ errors: ISBNError[] }>();
const emit = defineEmits<{ remove: [isbn: string] }>();
</script>

<template>
  <Alert
    v-for="error in props.errors"
    :key="error.isbn"
    :type="error.message === CART_ERRORS.INTERNAL_ERROR ? 'error' : 'warning'"
    class="mb-1"
    :on-dismiss="() => emit('remove', error.isbn)"
  >
    <template v-if="error.message === CART_ERRORS.INTERNAL_ERROR">
      Une erreur est survenue lors de l'ajout de {{ error.isbn }}
    </template>
    <template v-else-if="error.message === CART_ERRORS.ITEM_NOT_FOUND">
      Aucun article trouvé pour {{ error.isbn }}
    </template>
    <template v-else-if="error.message === CART_ERRORS.NO_STOCK && error.id">
      <span>
        Pas de stock pour
        <RouterLink :to="`/item/${String(error.id)}`" class="underline">
          {{ error.title }}
        </RouterLink>
      </span>
    </template>
  </Alert>
</template>
