<script setup lang="ts">
import { clsx } from "clsx";

import { BUTTON_HOVER_STYLES, BUTTON_STYLES } from "./buttonStyles";
</script>

<template>
  <a :class="clsx(BUTTON_STYLES, BUTTON_HOVER_STYLES)">
    <slot />
  </a>
</template>
