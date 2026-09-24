<script setup lang="ts">
import { faRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
</script>

<template>
  <div class="flex flex-1 bg-white opacity-40">
    <slot />
  </div>
  <FontAwesomeIcon
    :icon="faRotate"
    spin
    class="absolute inset-0 m-auto"
    size="2x"
  />
</template>
