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

import { COMMON_STYLES } from "@/components/formControls";
import type { CustomerSelection } from "@/components/orderForm";
import { useTRPCQuery } from "@/utils/query";
import { useDebouncedValue } from "@/utils/useDebouncedValue";
import { useDelayedLoading } from "@/utils/useDelayedLoading";

const props = defineProps<{
  fullWidth?: boolean;
  inputClass?: string;
  placeholder?: string;
  required?: boolean;
}>();

const customer = defineModel<CustomerSelection | null>("customer", {
  required: true,
});

const query = ref("");
const debouncedQuery = useDebouncedValue(query, 300);
const {
  data: results,
  isError,
  isFetching,
} = useTRPCQuery("searchCustomer", debouncedQuery, {
  staleTime: 60000,
  placeholderData: keepPreviousData,
});
const showLoading = useDelayedLoading(isFetching, 500);
const filteredCustomers = computed(() => results.value || []);
const inputStyles = computed(() =>
  props.fullWidth ? COMMON_STYLES : COMMON_STYLES.replace("w-full", "w-fit"),
);
</script>

<template>
  <Combobox v-model="customer" by="id">
    <div :class="clsx('relative', props.fullWidth ? 'w-full' : 'w-fit')">
      <ComboboxInput
        :class="clsx(inputStyles, props.inputClass)"
        :display-value="
          (value: unknown) =>
            (value as CustomerSelection | null)?.fullname ?? ''
        "
        :placeholder="props.placeholder"
        :required="props.required"
        @change="
          (event) => {
            query = (event.target as HTMLInputElement).value;
          }
        "
      />
      <ComboboxOptions
        class="absolute z-10 w-full max-h-40 overflow-auto rounded-md p-1 shadow-lg ring-1 ring-black/5 bg-gray-light"
      >
        <li v-if="showLoading" class="px-2 py-1 text-sm italic">Chargement…</li>
        <li v-if="isError" class="px-2 py-1 text-sm [color:#721c24]">
          Erreur de chargement
        </li>
        <ComboboxOption
          v-for="option in filteredCustomers"
          v-slot="{ active, selected }"
          :key="option.id"
          :value="option"
          as="template"
        >
          <li
            :class="
              clsx('pl-8 relative', active ? 'bg-gray-light' : 'bg-white')
            "
          >
            {{ option.fullname }}
            <span
              v-if="selected"
              class="absolute inset-y-0 left-0 pl-2 flex items-center"
            >
              <FontAwesomeIcon :icon="faCheck" />
            </span>
          </li>
        </ComboboxOption>
      </ComboboxOptions>
    </div>
  </Combobox>
</template>
