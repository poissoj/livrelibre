<script setup lang="ts">
import {
  faAt,
  faInfoCircle,
  faPersonWalking,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { clsx } from "clsx";
import { RouterLink, useRouter } from "vue-router";

import { formatDateFR } from "@livrelibre/shared/date";
import type { OrderRow } from "@livrelibre/shared/order";

import StatusCircle from "@/components/StatusCircle.vue";
import { useQueryParams } from "@/utils/useQueryParams";

import NotifiedCheckbox from "./NotifiedCheckbox.vue";

const props = defineProps<{ item: OrderRow }>();

const router = useRouter();
const { query } = useQueryParams();

const go = () => {
  void router.push({
    path: `/order/${String(props.item.id)}`,
    query: query.value,
  });
};
const stopPropagation = (event: MouseEvent) => {
  event.stopPropagation();
};
</script>

<template>
  <tr class="cursor-pointer" @click="go">
    <td class="pl-2 py-1">{{ formatDateFR(props.item.created) }}</td>
    <td class="p-1">
      <div class="leading-4">{{ props.item.customerName }}</div>
      <div class="leading-5 italic pl-2">
        <template v-if="props.item.contact === 'phone'">
          <FontAwesomeIcon :icon="faPhone" class="mr-1" />
          <span>{{ props.item.phone }}</span>
        </template>
        <template v-else-if="props.item.contact === 'mail'">
          <FontAwesomeIcon :icon="faAt" class="mr-1" />
          <span>{{ props.item.email }}</span>
        </template>
        <template v-else-if="props.item.contact === 'in person'">
          <FontAwesomeIcon :icon="faPersonWalking" class="mr-1" />
          <span>Passera</span>
        </template>
      </div>
    </td>
    <td
      :class="clsx('w-2', { 'bg-[rgba(245,0,0,0.5)]': props.item.paid })"
    ></td>
    <td class="p-2">
      <div class="leading-4">
        <RouterLink
          :to="{ path: `/order/${String(props.item.id)}`, query }"
          @click.stop
        >
          {{ props.item.itemTitle }}
        </RouterLink>
        <span v-if="props.item.nb > 1" class="font-bold ml-2">
          ({{ props.item.nb }} ex)
        </span>
      </div>
      <div class="italic font-number leading-5">{{ props.item.isbn }}</div>
    </td>
    <td class="p-1">{{ props.item.distributor }}</td>
    <td class="p-1">
      <StatusCircle :status="props.item.ordered" class="mx-auto" />
    </td>
    <td class="p-1 text-center" @click="stopPropagation">
      <NotifiedCheckbox :order="props.item" />
    </td>
    <td class="p-1 text-center">
      <input
        type="checkbox"
        aria-label="Payé"
        disabled
        :checked="props.item.paid"
      />
    </td>
    <td class="p-1">
      <span
        v-if="props.item.comment"
        role="img"
        :aria-label="props.item.comment"
        :title="props.item.comment"
      >
        <FontAwesomeIcon
          :icon="faInfoCircle"
          size="lg"
          :style="{ color: '#23a3b9' }"
        />
      </span>
    </td>
  </tr>
</template>
