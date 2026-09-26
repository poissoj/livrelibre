<script setup lang="ts">
import { Toaster } from "vue-sonner";
</script>

<template>
  <RouterView />
  <Toaster position="bottom-left" theme="light" rich-colors />
</template>
