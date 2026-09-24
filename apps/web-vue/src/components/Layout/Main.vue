<script setup lang="ts">
import { clsx } from "clsx";

const props = defineProps<{ className?: string }>();
</script>

<template>
  <main :class="clsx('p-lg flex overflow-auto', props.className)">
    <slot />
  </main>
</template>
