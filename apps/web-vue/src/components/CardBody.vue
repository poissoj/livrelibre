<script setup lang="ts">
import { clsx } from "clsx";

import ErrorBoundary from "./ErrorBoundary.vue";

const props = defineProps<{ className?: string }>();
</script>

<template>
  <div :class="clsx('mt-md overflow-auto flex', props.className)">
    <ErrorBoundary>
      <slot />
    </ErrorBoundary>
  </div>
</template>
