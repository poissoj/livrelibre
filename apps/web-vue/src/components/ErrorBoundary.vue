<script setup lang="ts">
import { onErrorCaptured, ref } from "vue";

import ErrorMessage from "./ErrorMessage.vue";

const error = ref<unknown>(null);

onErrorCaptured((err) => {
  error.value = err;
  return false;
});
</script>

<template>
  <ErrorMessage v-if="error" :error="error" />
  <slot v-else />
</template>
