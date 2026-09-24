<script setup lang="ts">
import useUser from "@/lib/useUser";

import Alert from "./Alert.vue";

const props = defineProps<{ role: string }>();

const { user } = useUser();
</script>

<template>
  <div v-if="user?.role !== props.role">
    <Alert type="warning">
      Vous n’êtes pas autorisé à accéder à cette partie.
    </Alert>
  </div>
  <slot v-else />
</template>
