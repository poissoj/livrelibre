<script setup lang="ts">
import AppSkeleton from "@/components/AppSkeleton.vue";
</script>

<template>
  <AppSkeleton :height="250">
    <template v-for="n in 8" :key="n">
      <rect
        x="5%"
        :y="(n - 1) * 30 + 15"
        rx="5"
        ry="5"
        width="70%"
        height="10"
      />
      <circle cx="90%" :cy="(n - 1) * 30 + 20" r="8" />
      <circle cx="95%" :cy="(n - 1) * 30 + 20" r="8" />
    </template>
  </AppSkeleton>
</template>
