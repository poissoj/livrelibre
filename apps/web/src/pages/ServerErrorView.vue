<script setup lang="ts">
import { faRedo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import AppButton from "@/components/AppButton.vue";

defineEmits<{ retry: [] }>();
</script>

<template>
  <div class="flex-1 self-center text-center text-2xl">
    <h1 class="font-bold">Erreur 500</h1>
    <p>Erreur interne</p>
    <AppButton type="button" class="mt-lg" @click="$emit('retry')">
      <FontAwesomeIcon :icon="faRedo" class="mr-sm" />
      Réessayer
    </AppButton>
  </div>
</template>
