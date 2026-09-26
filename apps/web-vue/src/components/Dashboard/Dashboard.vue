<script setup lang="ts">
import Bookmarks from "./Bookmarks.vue";
import SellNewItem from "./SellNewItem.vue";
</script>

<template>
  <div class="flex items-start gap-lg flex-1 flex-wrap">
    <Bookmarks />
    <div class="flex flex-col gap-lg flex-1">
      <SellNewItem />
    </div>
  </div>
</template>
