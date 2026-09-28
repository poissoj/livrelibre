<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import RestrictedContent from "@/components/RestrictedContent.vue";
import SalesByDay from "@/components/Sales/SalesByDay.vue";

const route = useRoute();
const date = computed(
  () =>
    `${String(route.params.year)}-${String(route.params.month)}-${String(route.params.day)}`,
);
</script>

<template>
  <RestrictedContent role="admin">
    <SalesByDay :date="date" />
  </RestrictedContent>
</template>
