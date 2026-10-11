<script setup lang="ts">
import { TEXTAREA_STYLES } from "./formControls";

const model = defineModel<string | number | null | undefined>();
</script>

<template>
  <textarea v-model="model" :class="TEXTAREA_STYLES" />
</template>
