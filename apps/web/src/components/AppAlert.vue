<script setup lang="ts">
import {
  faCheckCircle,
  faExclamationCircle,
  faExclamationTriangle,
  faInfoCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { clsx } from "clsx";
import { computed } from "vue";

import type { AlertType } from "./form";

const props = withDefaults(
  defineProps<{
    type: AlertType;
    dismissible?: boolean;
  }>(),
  { dismissible: true },
);

const emit = defineEmits<{ dismiss: [] }>();

const ALERT_STYLES = {
  success: "[color:#0f5132] [border-color:#badbcc] [background-color:#d1e7dd]",
  warning: "[color:#664d03] [border-color:#ffecb5] [background-color:#fff3cd]",
  error: "[color:#842029] [border-color:#f5c2c7] [background-color:#f8d7da]",
  info: "[color:#055160] [border-color:#b6effb] [background-color:#cff4fc]",
} as const;

const ICONS = {
  success: faCheckCircle,
  warning: faExclamationTriangle,
  error: faExclamationCircle,
  info: faInfoCircle,
} as const;

const style = computed(() => ALERT_STYLES[props.type]);
const role = computed(() =>
  props.type === "error" || props.type === "warning" ? "alert" : "status",
);
</script>

<template>
  <div
    :role="role"
    :class="clsx('p-sm border rounded flex items-center', style)"
  >
    <FontAwesomeIcon :icon="ICONS[props.type]" class="mr-sm" />
    <slot />
    <button
      v-if="props.dismissible"
      type="button"
      class="ml-auto p-2"
      aria-label="Fermer"
      @click="emit('dismiss')"
    >
      <FontAwesomeIcon :icon="faTimes" size="lg" />
    </button>
  </div>
</template>
