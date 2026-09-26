<script setup lang="ts">
import { RouterView } from "vue-router";
import { Toaster } from "vue-sonner";
</script>

<template>
  <RouterView />
  <Toaster position="bottom-left" theme="light" rich-colors />
</template>
