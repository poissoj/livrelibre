<script setup lang="ts">
const props = withDefaults(defineProps<{ level?: 1 | 2 | 3 }>(), {
  level: 2,
});
</script>

<template>
  <component :is="`h${props.level}`" class="text-2xl font-bold">
    <slot />
  </component>
</template>
