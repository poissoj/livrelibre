<script setup lang="ts">
import { useTemplateRef } from "vue";

import { COMMON_STYLES } from "./formControls";

const model = defineModel<string | number | null | undefined>();

const input = useTemplateRef<HTMLInputElement>("input");
const focus = () => input.value?.focus();
defineExpose({ focus });
</script>

<template>
  <input ref="input" v-model="model" :class="COMMON_STYLES" />
</template>
