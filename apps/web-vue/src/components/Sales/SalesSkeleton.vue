<script setup lang="ts">
import Skeleton from "@/components/Skeleton.vue";
</script>

<template>
  <Skeleton :height="300">
    <template v-for="n in 9" :key="n">
      <rect
        :x="0"
        :y="(n - 1) * 30 + 15"
        rx="2"
        ry="2"
        width="35%"
        height="15"
      />
      <rect
        x="42%"
        :y="(n - 1) * 30 + 15"
        rx="2"
        ry="2"
        width="20%"
        height="15"
      />
      <rect
        x="76%"
        :y="(n - 1) * 30 + 15"
        rx="2"
        ry="2"
        width="2%"
        height="15"
      />
      <rect
        x="80%"
        :y="(n - 1) * 30 + 15"
        rx="2"
        ry="2"
        width="3%"
        height="15"
      />
      <rect
        x="85%"
        :y="(n - 1) * 30 + 15"
        rx="2"
        ry="2"
        width="3%"
        height="15"
      />
      <rect
        x="90%"
        :y="(n - 1) * 30 + 15"
        rx="2"
        ry="2"
        width="4%"
        height="15"
      />
      <rect
        x="96%"
        :y="(n - 1) * 30 + 15"
        rx="2"
        ry="2"
        width="2%"
        height="15"
      />
    </template>
  </Skeleton>
</template>
