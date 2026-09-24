<script setup lang="ts">
import { formatDate } from "@livrelibre/shared/date";

import SalesByDay from "@/components/Sales/SalesByDay.vue";

const date = formatDate(new Date());
</script>

<template>
  <SalesByDay :date="date" />
</template>
