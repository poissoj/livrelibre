<script setup lang="ts">
import { onErrorCaptured, ref } from "vue";

import { logUnexpectedError } from "@/utils/errors";

import ErrorMessage from "./ErrorMessage.vue";

const error = ref<unknown>(null);

onErrorCaptured((err) => {
  error.value = err;
  logUnexpectedError(err);
  return false;
});
</script>

<template>
  <template v-if="error">
    <slot name="fallback">
      <ErrorMessage :error="error" />
    </slot>
  </template>
  <slot v-else />
</template>
