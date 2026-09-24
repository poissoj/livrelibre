<script setup lang="ts">
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { clsx } from "clsx";
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";

const props = defineProps<{ href: string; icon: IconDefinition }>();

const route = useRoute();
const active = computed(() => route.path === props.href);
</script>

<template>
  <RouterLink
    :to="props.href"
    :aria-current="active ? 'page' : undefined"
    :class="
      clsx(
        'block p-md transition-colors duration-300 ease-out border-l-4',
        'hover:bg-gray-darkest',
        'focus:outline-none focus:bg-gray-darkest',
        active ? 'border-primary' : 'border-transparent',
      )
    "
  >
    <FontAwesomeIcon :icon="props.icon" class="mr-sm" /><slot />
  </RouterLink>
</template>
