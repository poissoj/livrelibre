<script setup lang="ts">
import { clsx } from "clsx";

const props = defineProps<{
  label: string;
  fieldClass?: string;
}>();
</script>

<template>
  <label class="flex cursor-pointer mb-md items-center">
    <span class="text-right mr-lg font-medium w-1/4 shrink-0 whitespace-nowrap">
      {{ props.label }}
    </span>
    <div :class="clsx('flex w-2/3', props.fieldClass)">
      <slot />
    </div>
  </label>
</template>
