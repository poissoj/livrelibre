<script setup lang="ts">
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/vue";
import { keepPreviousData } from "@tanstack/vue-query";
import { clsx } from "clsx";
import { computed, ref } from "vue";

import { formatPrice } from "@livrelibre/shared/format";

import { COMMON_STYLES } from "@/components/formControls";
import type { ItemValue, NewItem } from "@/components/selectItem";
import { useTRPCQuery } from "@/utils/query";
import { useDebouncedValue } from "@/utils/useDebouncedValue";
import { useDelayedLoading } from "@/utils/useDelayedLoading";

const props = defineProps<{
  fullWidth?: boolean;
  inputClass?: string;
}>();

const item = defineModel<ItemValue>("item", { required: true });

const search = ref("");
const debouncedSearch = useDebouncedValue(search, 300);
const {
  data: searchResults,
  isError,
  isFetching,
} = useTRPCQuery(
  "quicksearch",
  computed(() => ({ search: debouncedSearch.value })),
  { staleTime: 60000, placeholderData: keepPreviousData },
);
const showLoading = useDelayedLoading(isFetching, 500);
const filteredItems = computed(() => searchResults.value?.items || []);
const newItemOption = computed<NewItem>(() => ({
  id: null,
  title: search.value,
}));
const inputStyles = computed(() =>
  props.fullWidth ? COMMON_STYLES : COMMON_STYLES.replace("w-full", "w-fit"),
);
</script>

<template>
  <Combobox v-model="item" by="id">
    <div :class="clsx('relative', props.fullWidth ? 'w-full' : 'w-fit')">
      <ComboboxInput
        :class="clsx(inputStyles, props.inputClass)"
        :display-value="(value: unknown) => (value as ItemValue)?.title ?? ''"
        @change="
          (event) => {
            search = event.target.value;
          }
        "
      />
      <ComboboxOptions
        class="absolute z-10 w-full max-h-56 overflow-auto rounded-md shadow-lg ring-1 ring-black/5 bg-gray-light"
        as="ul"
      >
        <li v-if="showLoading" class="px-2 py-1 text-sm italic">Chargement…</li>
        <li v-if="isError" class="px-2 py-1 text-sm [color:#721c24]">
          Erreur de chargement
        </li>
        <ComboboxOption
          v-if="search.length > 0"
          v-slot="{ active, selected }"
          :value="newItemOption"
          as="template"
        >
          <li
            :aria-label="`Article non répertorié : ${search}`"
            :class="
              clsx(
                'px-2 flex gap-2 items-center',
                active ? 'bg-gray-light' : 'bg-white',
              )
            "
          >
            <span :class="!selected && 'invisible'">
              <FontAwesomeIcon :icon="faCheck" />
            </span>
            <div class="flex flex-col grow py-1">
              <span class="leading-tight">{{ search }}</span>
              <span class="text-xs italic">Article non répertorié</span>
            </div>
          </li>
        </ComboboxOption>
        <ComboboxOption
          v-for="option in filteredItems"
          v-slot="{ active, selected }"
          :key="option.id"
          :value="option"
          as="template"
        >
          <li
            :class="
              clsx(
                'px-2 flex gap-2 items-center',
                active ? 'bg-gray-light' : 'bg-white',
              )
            "
          >
            <span :class="clsx(!selected && 'invisible')">
              <FontAwesomeIcon :icon="faCheck" />
            </span>
            <div class="flex flex-col grow py-1">
              <span class="leading-tight">{{ option.title }}</span>
              <div class="text-xs">
                <span class="mr-2">{{ option.distributor }}</span>
                <span class="italic mr-auto">{{ option.isbn }}</span>
              </div>
            </div>
            <span class="font-number text-sm">
              {{ formatPrice(Number(option.price)) }}
            </span>
          </li>
        </ComboboxOption>
      </ComboboxOptions>
    </div>
  </Combobox>
</template>
