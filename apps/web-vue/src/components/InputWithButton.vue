<script setup lang="ts">
import { clsx } from "clsx";

import { COMMON_STYLES } from "./formControls";

const model = defineModel<string | number | null | undefined>();
</script>

<template>
  <input v-model="model" :class="clsx(COMMON_STYLES, 'rounded-r-none')" />
</template>
