<script setup lang="ts">
import { faRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
</script>

<template>
  <div class="flex h-full items-center justify-center">
    <FontAwesomeIcon :icon="faRotate" spin size="2x" />
  </div>
</template>
