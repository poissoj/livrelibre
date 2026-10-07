<script setup lang="ts">
import { CONTACT_MEAN_LABEL, type ContactMean } from "@livrelibre/shared/order";
import { clsx } from "clsx";
import { useId } from "vue";

const props = defineProps<{ mean: ContactMean; isActive: boolean }>();
const model = defineModel<ContactMean>();

const id = useId();
</script>

<template>
  <span class="contents">
    <input
      :id="id"
      v-model="model"
      type="radio"
      name="contact"
      :value="props.mean"
      :aria-label="CONTACT_MEAN_LABEL[props.mean]"
      class="peer sr-only"
    />
    <label
      :for="id"
      :class="
        clsx(
          'rounded px-3 py-2 border-2 cursor-pointer',
          '[transition:border-color_ease-in-out_0.15s]',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/60',
          { grow: props.mean === 'mail' },
          { 'basis-40': props.mean === 'phone' },
          props.isActive ? 'border-primary' : '[border-color:#ccc]',
        )
      "
    >
      <slot />
    </label>
  </span>
</template>
