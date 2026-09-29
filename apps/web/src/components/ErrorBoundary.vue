<script setup lang="ts">
import { onErrorCaptured, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { logUnexpectedError } from "@/utils/errors";

import ErrorMessage from "./ErrorMessage.vue";

const error = ref<unknown>(null);

const reset = () => {
  error.value = null;
};

const route = useRoute();
watch(() => route.fullPath, reset);

onErrorCaptured((err) => {
  error.value = err;
  logUnexpectedError(err);
  return false;
});
</script>

<template>
  <template v-if="error">
    <slot name="fallback" :error="error" :reset="reset">
      <ErrorMessage :error="error" :on-retry="reset" />
    </slot>
  </template>
  <slot v-else />
</template>
