<script setup lang="ts">
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { clsx } from "clsx";
import { RouterLink } from "vue-router";

const props = defineProps<{ href: string; icon: IconDefinition }>();
</script>

<template>
  <RouterLink
    v-slot="{ href: resolvedHref, navigate, isExactActive }"
    :to="props.href"
    custom
  >
    <a
      :href="resolvedHref"
      :aria-current="isExactActive ? 'page' : undefined"
      :class="
        clsx(
          'block p-md transition-colors duration-300 ease-out border-l-4',
          'hover:bg-gray-darkest',
          'focus:outline-none focus:bg-gray-darkest',
          isExactActive ? 'border-primary' : 'border-transparent',
        )
      "
      @click="navigate"
    >
      <FontAwesomeIcon :icon="props.icon" class="mr-sm" /><slot />
    </a>
  </RouterLink>
</template>
