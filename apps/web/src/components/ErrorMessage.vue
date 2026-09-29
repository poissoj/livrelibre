<script setup lang="ts">
import { faExclamationCircle, faRedo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed } from "vue";

import AppButton from "@/components/AppButton.vue";
import { getErrorMessage } from "@/utils/errors";

const props = defineProps<{ error?: unknown; onRetry?: () => void }>();

const message = computed(() =>
  getErrorMessage(props.error, "Impossible de récupérer les données"),
);
</script>

<template>
  <div
    class="p-sm [border:1px_solid_#f5c6cb] [color:#721c24] [background-color:#f8d7da] self-start"
  >
    <p class="mb-sm whitespace-pre-line">
      <FontAwesomeIcon :icon="faExclamationCircle" class="mr-sm" />
      {{ message }}
    </p>
    <AppButton
      v-if="props.onRetry"
      type="button"
      class="mt-sm"
      @click="props.onRetry()"
    >
      <FontAwesomeIcon :icon="faRedo" class="mr-sm" />
      Réessayer
    </AppButton>
  </div>
</template>
