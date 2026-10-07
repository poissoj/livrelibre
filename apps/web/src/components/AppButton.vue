<script setup lang="ts">
import { clsx } from "clsx";
import { computed, useAttrs } from "vue";

import { BUTTON_HOVER_STYLES, BUTTON_STYLES } from "./buttonStyles";

const attrs = useAttrs();

const classes = computed(() => clsx(BUTTON_STYLES, !attrs.disabled && BUTTON_HOVER_STYLES));
</script>

<template>
  <button :class="classes">
    <slot />
  </button>
</template>
