<script setup lang="ts">
import Header from "./Header.vue";
import Main from "./Main.vue";
import Sidebar from "./Sidebar.vue";
</script>

<template>
  <div class="h-full flex flex-col isolate">
    <Header />
    <div class="flex flex-1 overflow-hidden">
      <Sidebar />
      <Main class="flex-1">
        <slot />
      </Main>
    </div>
  </div>
</template>
