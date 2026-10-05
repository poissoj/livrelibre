<script setup lang="ts">
import { faRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { clsx } from "clsx";

const props = withDefaults(defineProps<{ loading?: boolean }>(), {
  loading: false,
});
</script>

<template>
  <div
    :class="clsx('flex flex-1', props.loading && 'bg-white opacity-40')"
    :aria-busy="props.loading"
  >
    <slot />
  </div>
  <span v-if="props.loading" class="sr-only" role="status">Chargement…</span>
  <FontAwesomeIcon
    v-if="props.loading"
    :icon="faRotate"
    spin
    aria-hidden="true"
    class="absolute inset-0 m-auto"
    size="2x"
  />
</template>
