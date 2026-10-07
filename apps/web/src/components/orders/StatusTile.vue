<script setup lang="ts">
import { type OrderStatus, STATUS_LABEL } from "@livrelibre/shared/order";
import { clsx } from "clsx";

import StatusCircle from "@/components/StatusCircle.vue";

const props = defineProps<{ status: OrderStatus; checked: boolean }>();
const emit = defineEmits<{ toggle: [] }>();

const id = `chk-${props.status}`;
</script>

<template>
  <div>
    <input
      :id="id"
      type="checkbox"
      :name="props.status"
      :checked="props.checked"
      class="peer absolute w-0 h-0 overflow-hidden outline-none"
      @change="emit('toggle')"
    />
    <label
      :for="id"
      :class="
        clsx(
          'flex flex-col items-center justify-center gap-2 shrink-0',
          'p-1 border-2 w-20 h-16 rounded cursor-pointer',
          'peer-focus-visible:ring-3 peer-focus-visible:ring-primary/50',
          'hover:ring-2 hover:ring-primary/50',
          props.checked
            ? 'border-primary text-primary-darkest'
            : 'border-[#ccc] saturate-0 opacity-75',
        )
      "
    >
      <StatusCircle :status="props.status" decorative class="scale-125" />
      <span class="text-xs font-medium">{{ STATUS_LABEL[props.status] }}</span>
    </label>
  </div>
</template>
