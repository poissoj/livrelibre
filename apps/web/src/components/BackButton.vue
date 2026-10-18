<script setup lang="ts">
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed, ref, watch } from "vue";
import { type RouteLocationRaw, useRoute, useRouter } from "vue-router";

import { BUTTON_HOVER_STYLES, BUTTON_STYLES } from "./buttonStyles";

const props = defineProps<{ fallback: RouteLocationRaw }>();

const router = useRouter();
const route = useRoute();

/**
 * Chemin interne de la page précédente, s'il existe. On ignore `/login` pour
 * ne pas renvoyer vers la page de connexion après une redirection.
 */
const previousPath = ref<string | null>(null);
watch(
  () => route.fullPath,
  () => {
    const back = router.options.history.state.back;
    previousPath.value =
      typeof back === "string" && back.startsWith("/") && !back.startsWith("/login") ? back : null;
  },
  { immediate: true },
);

const href = computed(() => router.resolve(previousPath.value ?? props.fallback).href);

const onClick = (event: MouseEvent) => {
  // Laisse le navigateur gérer les clics modifiés (nouvel onglet, etc.).
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }
  event.preventDefault();
  if (previousPath.value != null) {
    router.back();
  } else {
    void router.push(props.fallback);
  }
};
</script>

<template>
  <a :href="href" :class="[BUTTON_STYLES, BUTTON_HOVER_STYLES]" @click="onClick">
    <FontAwesomeIcon :icon="faTimesCircle" class="mr-sm" />
    Retour
  </a>
</template>
