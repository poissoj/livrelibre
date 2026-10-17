<script setup lang="ts">
import { clsx } from "clsx";
import { computed } from "vue";

import { BUTTON_HOVER_STYLES, BUTTON_STYLES } from "./buttonStyles";

const props = withDefaults(
  defineProps<{ disabled?: boolean; type?: "button" | "submit" | "reset" }>(),
  { disabled: false, type: "button" },
);

const classes = computed(() => clsx(BUTTON_STYLES, !props.disabled && BUTTON_HOVER_STYLES));
</script>

<template>
  <button :type="props.type" :disabled="props.disabled" :class="classes">
    <slot />
  </button>
</template>
