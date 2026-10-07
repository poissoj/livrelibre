<script setup lang="ts">
import { clsx } from "clsx";
import { useId } from "vue";

const props = defineProps<{
  label: string;
  fieldClass?: string;
  group?: boolean;
}>();

const labelId = useId();
</script>

<template>
  <div v-if="props.group" role="group" :aria-labelledby="labelId" class="flex mb-md items-center">
    <span :id="labelId" class="text-right mr-lg font-medium w-1/4 shrink-0 whitespace-nowrap">
      {{ props.label }}
    </span>
    <div :class="clsx('flex w-2/3', props.fieldClass)">
      <slot />
    </div>
  </div>
  <label v-else class="flex cursor-pointer mb-md items-center">
    <span class="text-right mr-lg font-medium w-1/4 shrink-0 whitespace-nowrap">
      {{ props.label }}
    </span>
    <div :class="clsx('flex w-2/3', props.fieldClass)">
      <slot />
    </div>
  </label>
</template>
