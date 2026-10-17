<script setup lang="ts">
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/vue";
import { keepPreviousData, useQuery } from "@tanstack/vue-query";
import { clsx } from "clsx";
import { computed, onMounted, ref, useTemplateRef, watch } from "vue";

import { COMMON_STYLES } from "@/components/formControls";
import type { CustomerSelection } from "@/components/orderForm";
import { queryKeys } from "@/lib/queryKeys";
import { trpcClient } from "@/utils/trpc";
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
} = useQuery({
  queryKey: () => queryKeys.customers.search(debouncedQuery.value),
  queryFn: () => trpcClient.searchCustomer.query(debouncedQuery.value),
  staleTime: 60000,
  placeholderData: keepPreviousData,
});
const showLoading = useDelayedLoading(isFetching, 500);
const filteredCustomers = computed(() => results.value || []);
const inputStyles = computed(() =>
  props.fullWidth ? COMMON_STYLES : COMMON_STYLES.replace("w-full", "w-fit"),
);

const REQUIRED_MESSAGE = "Merci de sélectionner un⋅e client⋅e";
const container = useTemplateRef<HTMLDivElement>("container");

// Keep the native validation bubble but show a domain-specific message.
const syncValidity = () => {
  const input = container.value?.querySelector("input");
  if (!input) return;
  input.setCustomValidity(props.required && customer.value === null ? REQUIRED_MESSAGE : "");
};

onMounted(syncValidity);
watch([customer, () => props.required], syncValidity);
</script>

<template>
  <Combobox v-model="customer" by="id">
    <div ref="container" :class="clsx('relative', props.fullWidth ? 'w-full' : 'w-fit')">
      <ComboboxInput
        :class="clsx(inputStyles, props.inputClass)"
        aria-label="Rechercher un⋅e client⋅e"
        :display-value="(value: unknown) => (value as CustomerSelection | null)?.fullname ?? ''"
        :placeholder="props.placeholder"
        :required="props.required"
        @change="
          (event) => {
            query = event.target.value;
          }
        "
      />
      <ComboboxOptions
        class="absolute z-10 w-full max-h-40 overflow-auto rounded-md p-1 shadow-lg ring-1 ring-black/5 bg-gray-light"
      >
        <li v-if="showLoading" class="px-2 py-1 text-sm italic">Chargement…</li>
        <li v-if="isError" class="px-2 py-1 text-sm [color:#721c24]">Erreur de chargement</li>
        <ComboboxOption
          v-for="option in filteredCustomers"
          v-slot="{ active, selected }"
          :key="option.id"
          :value="option"
          as="template"
        >
          <li :class="clsx('pl-8 relative', active ? 'bg-gray-light' : 'bg-white')">
            {{ option.fullname }}
            <span v-if="selected" class="absolute inset-y-0 left-0 pl-2 flex items-center">
              <FontAwesomeIcon :icon="faCheck" />
            </span>
          </li>
        </ComboboxOption>
      </ComboboxOptions>
    </div>
  </Combobox>
</template>
