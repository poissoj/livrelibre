<script setup lang="ts">
import { computed, useSlots, watchEffect } from "vue";

import { APP_NAME } from "@/lib/config";

const slots = useSlots();
const text = computed(() => {
  const nodes = slots.default?.() ?? [];
  if (nodes.length === 0) return "";
  const first = nodes[0];
  return typeof first.children === "string" ? first.children : "";
});

watchEffect(() => {
  if (text.value) {
    document.title = `${text.value} | ${APP_NAME}`;
  }
});
</script>

<template>
  <span v-if="false" />
</template>
