<script setup lang="ts">
import { clsx } from "clsx";
import { useTemplateRef } from "vue";

import { useScrollToTopOnPageChange } from "@/utils/scroll";

import ErrorBoundary from "./ErrorBoundary.vue";

const props = withDefaults(defineProps<{ scroll?: boolean }>(), { scroll: true });

const body = useTemplateRef<HTMLElement>("body");
useScrollToTopOnPageChange(body);
</script>

<template>
  <div
    ref="body"
    :class="clsx('mt-md pb-sm flex', props.scroll ? 'overflow-auto' : 'overflow-visible')"
  >
    <ErrorBoundary>
      <slot />
    </ErrorBoundary>
  </div>
</template>
