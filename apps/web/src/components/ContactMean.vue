<script setup lang="ts">
import { clsx } from "clsx";

import type { ContactMean } from "@livrelibre/shared/order";

const props = defineProps<{ mean: ContactMean; isActive: boolean }>();
const model = defineModel<ContactMean>();
</script>

<template>
  <input
    :id="'radio-' + props.mean"
    v-model="model"
    type="radio"
    name="contact"
    :value="props.mean"
    class="hidden"
  />
  <label
    :for="'radio-' + props.mean"
    :class="
      clsx(
        'rounded px-3 py-2 focus:outline-none border-2 cursor-pointer',
        '[transition:border-color_ease-in-out_0.15s]',
        { grow: props.mean === 'mail' },
        { 'basis-40': props.mean === 'phone' },
        props.isActive ? 'border-primary' : '[border-color:#ccc]',
      )
    "
  >
    <slot />
  </label>
</template>
