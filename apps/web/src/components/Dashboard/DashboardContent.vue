<script setup lang="ts">
import BookmarksCard from "./BookmarksCard.vue";
import SellNewItem from "./SellNewItem.vue";
</script>

<template>
  <div class="flex items-start gap-lg flex-1 flex-wrap">
    <h1 class="sr-only">Tableau de bord</h1>
    <BookmarksCard />
    <div class="flex flex-col gap-lg flex-1">
      <SellNewItem />
    </div>
  </div>
</template>
