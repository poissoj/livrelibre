<script setup lang="ts">
import Card from "./Card.vue";
import CardBody from "./CardBody.vue";
import CardTitle from "./CardTitle.vue";

const props = defineProps<{ title: string }>();
</script>

<template>
  <Card class="max-h-full overflow-hidden flex flex-col">
    <CardTitle>{{ props.title }}</CardTitle>
    <slot name="subtitle" />
    <CardBody>
      <slot />
    </CardBody>
  </Card>
</template>
