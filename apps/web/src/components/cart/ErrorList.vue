<script setup lang="ts">
import { RouterLink } from "vue-router";

import AppAlert from "@/components/AppAlert.vue";

import type { ISBNError } from "./types";

const props = defineProps<{ errors: ISBNError[] }>();
const emit = defineEmits<{ remove: [isbn: string] }>();
</script>

<template>
  <AppAlert
    v-for="error in props.errors"
    :key="error.isbn"
    :type="error.message === 'INTERNAL_ERROR' ? 'error' : 'warning'"
    class="mb-1"
    @dismiss="emit('remove', error.isbn)"
  >
    <template v-if="error.message === 'INTERNAL_ERROR'">
      Une erreur est survenue lors de l'ajout de {{ error.isbn }}
    </template>
    <template v-else-if="error.message === 'ITEM_NOT_FOUND'">
      Aucun article trouvé pour {{ error.isbn }}
    </template>
    <template v-else-if="error.message === 'NO_STOCK' && error.id">
      <span>
        Pas de stock pour
        <RouterLink :to="`/item/${String(error.id)}`" class="underline">
          {{ error.title }}
        </RouterLink>
      </span>
    </template>
  </AppAlert>
</template>
