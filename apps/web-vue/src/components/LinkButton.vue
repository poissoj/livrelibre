<script setup lang="ts">
import { clsx } from "clsx";
import { RouterLink } from "vue-router";
import type { RouteLocationRaw } from "vue-router";

import { BUTTON_HOVER_STYLES, BUTTON_STYLES } from "./buttonStyles";

const props = defineProps<{ to: RouteLocationRaw }>();
</script>

<template>
  <RouterLink :to="props.to" :class="clsx(BUTTON_STYLES, BUTTON_HOVER_STYLES)">
    <slot />
  </RouterLink>
</template>
