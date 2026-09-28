<script setup lang="ts">
import ErrorBoundary from "./ErrorBoundary.vue";
</script>

<template>
  <div class="mt-md overflow-auto flex">
    <ErrorBoundary>
      <slot />
    </ErrorBoundary>
  </div>
</template>
