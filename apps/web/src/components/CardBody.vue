<script setup lang="ts">
import { useTemplateRef } from "vue";

import { useScrollToTopOnPageChange } from "@/utils/scroll";

import ErrorBoundary from "./ErrorBoundary.vue";

const body = useTemplateRef<HTMLElement>("body");
useScrollToTopOnPageChange(body);
</script>

<template>
  <div ref="body" class="mt-md overflow-auto flex">
    <ErrorBoundary>
      <slot />
    </ErrorBoundary>
  </div>
</template>
