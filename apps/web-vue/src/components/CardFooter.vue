<script setup lang="ts">
import { clsx } from "clsx";

const props = defineProps<{ className?: string }>();
</script>

<template>
  <div
    :class="
      clsx(
        '[border-top:1px_solid_#ddd] mt-sm [padding:16px_8px_8px_0]',
        props.className,
      )
    "
  >
    <slot />
  </div>
</template>
