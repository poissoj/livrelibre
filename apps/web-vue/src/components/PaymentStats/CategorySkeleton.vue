<script setup lang="ts">
import Skeleton from "@/components/Skeleton.vue";
</script>

<template>
  <Skeleton :height="150">
    <template v-for="n in 5" :key="n">
      <rect
        x="5%"
        :y="(n - 1) * 30 + 15"
        rx="2"
        ry="2"
        width="27%"
        height="10"
      />
      <rect
        x="35%"
        :y="(n - 1) * 30 + 15"
        rx="2"
        ry="2"
        width="27%"
        height="10"
      />
      <rect
        x="65%"
        :y="(n - 1) * 30 + 15"
        rx="2"
        ry="2"
        width="27%"
        height="10"
      />
    </template>
  </Skeleton>
</template>
