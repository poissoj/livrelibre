<script setup lang="ts">
import { clsx } from "clsx";

import {
  type OrderStatus,
  STATUS_COLOR,
  STATUS_LABEL,
} from "@livrelibre/shared/order";

const props = defineProps<{ status: OrderStatus }>();
</script>

<template>
  <div
    :class="
      clsx(
        'border border-black/60 rounded-xl w-5 h-5',
        STATUS_COLOR[props.status],
      )
    "
    :title="STATUS_LABEL[props.status]"
  />
</template>
