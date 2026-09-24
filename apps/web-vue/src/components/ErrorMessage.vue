<script setup lang="ts">
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed } from "vue";

import { getErrorMessage } from "@/utils/errors";

const props = defineProps<{ error?: unknown }>();

const message = computed(() =>
  getErrorMessage(props.error, "Impossible de récupérer les données"),
);
</script>

<template>
  <div
    class="p-sm [border:1px_solid_#f5c6cb] [color:#721c24] [background-color:#f8d7da] self-start"
  >
    <p class="mb-sm">
      <FontAwesomeIcon :icon="faExclamationCircle" class="mr-sm" />
      Une erreur est survenue.
    </p>
    <pre>{{ message }}</pre>
  </div>
</template>
