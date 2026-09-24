<script setup lang="ts">
import { clsx } from "clsx";

const COMMON_STYLES =
  "bg-primary-dark text-white rounded p-sm uppercase tracking-wide font-medium " +
  "text-sm whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60";
const HOVER_STYLES =
  "transition-shadow transition-transform " +
  "hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.4)] hover:outline-none hover:-translate-y-px";
</script>

<template>
  <a :class="clsx(COMMON_STYLES, HOVER_STYLES)">
    <slot />
  </a>
</template>
