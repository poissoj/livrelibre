<script setup lang="ts">
import { clsx } from "clsx";

const props = defineProps<{ className?: string }>();
</script>

<template>
  <h3 :class="clsx('text-2xl font-bold', props.className)">
    <slot />
  </h3>
</template>
