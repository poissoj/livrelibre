<script setup lang="ts">
import { COMMON_STYLES } from "./formControls";

const model = defineModel<string | number | null | undefined>();
</script>

<template>
  <textarea v-model="model" :class="COMMON_STYLES" />
</template>
