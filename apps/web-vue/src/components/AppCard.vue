<script setup lang="ts">
import { clsx } from "clsx";
</script>

<template>
  <section
    :class="
      clsx(
        'bg-white rounded p-md 2xl:p-lg',
        'shadow-[0_2px_2px_0_rgb(0_0_0/0.14),0_1px_5px_0_rgb(0_0_0/0.12),0_3px_1px_-2px_rgb(0_0_0/0.2)]',
      )
    "
  >
    <slot />
  </section>
</template>
