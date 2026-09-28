<script setup lang="ts">
import AppHeader from "./AppHeader.vue";
import AppMain from "./AppMain.vue";
import AppSidebar from "./AppSidebar.vue";
</script>

<template>
  <div class="h-full flex flex-col isolate">
    <AppHeader />
    <div class="flex flex-1 overflow-hidden">
      <AppSidebar />
      <AppMain class="flex-1">
        <slot />
      </AppMain>
    </div>
  </div>
</template>
