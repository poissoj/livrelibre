<script setup lang="ts">
import { RouterView } from "vue-router";
import { Toaster } from "vue-sonner";

import ErrorBoundary from "@/components/ErrorBoundary.vue";
import ServerErrorView from "@/pages/ServerErrorView.vue";
</script>

<template>
  <ErrorBoundary>
    <template #fallback>
      <ServerErrorView />
    </template>
    <RouterView />
  </ErrorBoundary>
  <Toaster position="bottom-left" theme="light" rich-colors />
</template>
