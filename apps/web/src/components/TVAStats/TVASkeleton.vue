<script setup lang="ts">
import AppSkeleton from "@/components/AppSkeleton.vue";
</script>

<template>
  <AppSkeleton :height="300">
    <template v-for="n in 9" :key="n">
      <rect
        x="5%"
        :y="(n - 1) * 30 + 15"
        rx="2"
        ry="2"
        width="19%"
        height="10"
      />
      <rect
        x="27%"
        :y="(n - 1) * 30 + 15"
        rx="2"
        ry="2"
        width="19%"
        height="10"
      />
      <rect
        x="49%"
        :y="(n - 1) * 30 + 15"
        rx="2"
        ry="2"
        width="19%"
        height="10"
      />
      <rect
        x="71%"
        :y="(n - 1) * 30 + 15"
        rx="2"
        ry="2"
        width="19%"
        height="10"
      />
    </template>
  </AppSkeleton>
</template>
