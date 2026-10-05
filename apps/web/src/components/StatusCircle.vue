<script setup lang="ts">
import { clsx } from "clsx";

import {
  type OrderStatus,
  STATUS_COLOR,
  STATUS_LABEL,
} from "@livrelibre/shared/order";

const props = withDefaults(
  defineProps<{ status: OrderStatus; decorative?: boolean }>(),
  { decorative: false },
);
</script>

<template>
  <div
    :class="
      clsx(
        'border border-black/60 rounded-xl w-5 h-5',
        STATUS_COLOR[props.status],
      )
    "
    :role="props.decorative ? undefined : 'img'"
    :aria-label="props.decorative ? undefined : STATUS_LABEL[props.status]"
    :aria-hidden="props.decorative ? 'true' : undefined"
    :title="STATUS_LABEL[props.status]"
  />
</template>
