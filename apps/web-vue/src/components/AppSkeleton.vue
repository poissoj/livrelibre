<script setup lang="ts">
import { computed } from "vue";
import { ContentLoader } from "vue-content-loader";

const props = defineProps<{ height: number }>();

const viewBox = computed(() => `0 0 1000 ${String(props.height)}`);
</script>

<template>
  <ContentLoader width="100%" :height="props.height" :viewBox="viewBox">
    <slot />
  </ContentLoader>
</template>
