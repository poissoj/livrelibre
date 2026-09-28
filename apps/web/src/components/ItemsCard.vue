<script setup lang="ts">
import AppCard from "./AppCard.vue";
import CardBody from "./CardBody.vue";
import CardTitle from "./CardTitle.vue";

const props = defineProps<{ title: string }>();
</script>

<template>
  <AppCard class="max-h-full overflow-hidden flex flex-col">
    <CardTitle>{{ props.title }}</CardTitle>
    <slot name="subtitle" />
    <CardBody>
      <slot />
    </CardBody>
  </AppCard>
</template>
