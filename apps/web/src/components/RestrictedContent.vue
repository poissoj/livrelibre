<script setup lang="ts">
import useUser from "@/lib/useUser";

import AppAlert from "./AppAlert.vue";

const props = defineProps<{ role: string }>();

const { user } = useUser();
</script>

<template>
  <div v-if="user?.role !== props.role">
    <AppAlert type="warning" :dismissible="false">
      Vous n’êtes pas autorisé à accéder à cette partie.
    </AppAlert>
  </div>
  <slot v-else />
</template>
