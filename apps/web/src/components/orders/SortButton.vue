<script setup lang="ts">
import { faSort, faSortAsc, faSortDesc } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed } from "vue";

import { useQueryParams } from "@/utils/useQueryParams";

import { DEFAULT_SORTBY } from "./sort";

const props = defineProps<{ label: string; by: string }>();

const { query, push } = useQueryParams();
const selected = computed(() =>
  typeof query.value.sortBy === "string" ? query.value.sortBy : DEFAULT_SORTBY,
);
const icon = computed(() => {
  if (props.by === selected.value) return faSortDesc;
  if (props.by + "Desc" === selected.value) return faSortAsc;
  return faSort;
});
const updateSort = () => {
  let by = props.by;
  if (selected.value === by) {
    by = selected.value + "Desc";
  }
  void push({ query: { ...query.value, sortBy: by } });
};
</script>

<template>
  <button type="button" class="flex gap-1 items-center" @click="updateSort">
    {{ props.label }}
    <FontAwesomeIcon :icon="icon" />
  </button>
</template>
