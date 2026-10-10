<script setup lang="ts">
import { faEdit, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

import AppAlert from "@/components/AppAlert.vue";
import AppButton from "@/components/AppButton.vue";
import LinkButton from "@/components/LinkButton.vue";
import type { CustomerSelection } from "@/components/orderForm";
import SelectCustomer from "@/components/SelectCustomer.vue";
import { getErrorMessage } from "@/utils/errors";
import { type RouterInput, trpcClient } from "@/utils/trpc";

import CustomerInfos from "./CustomerInfos.vue";

const {
  data: selectedCustomer,
  isSuccess,
  isError,
} = useQuery({
  queryKey: ["selectedCustomer"],
  queryFn: () => trpcClient.selectedCustomer.query(),
});
const queryClient = useQueryClient();
const { mutate: selectCustomer } = useMutation({
  mutationFn: (input: RouterInput["selectCustomer"]) => trpcClient.selectCustomer.mutate(input),
  meta: { errorToast: false },
  onSuccess() {
    void queryClient.invalidateQueries({ queryKey: ["selectedCustomer"] });
  },
  onError(error) {
    toast.error(getErrorMessage(error));
  },
});

const onSelect = (customer: CustomerSelection | null) => {
  selectCustomer({ asideCart: false, customerId: customer?.id ?? null });
};
</script>

<template>
  <AppAlert v-if="isError" type="error" :dismissible="false">
    Impossible de charger le⋅la client⋅e associé⋅e.
  </AppAlert>
  <div v-else-if="isSuccess">
    <div class="flex gap-1">
      <SelectCustomer
        :customer="selectedCustomer ?? null"
        placeholder="Associer un⋅e client⋅e…"
        @update:customer="onSelect"
      />
      <template v-if="selectedCustomer">
        <LinkButton
          :to="`/customer/${String(selectedCustomer.id)}`"
          aria-label="Modifier"
          title="Modifier"
        >
          <FontAwesomeIcon :icon="faEdit" />
        </LinkButton>
        <AppButton type="button" aria-label="Dissocier" title="Dissocier" @click="onSelect(null)">
          <FontAwesomeIcon :icon="faTimesCircle" />
        </AppButton>
      </template>
    </div>
    <CustomerInfos v-if="selectedCustomer" :customer="selectedCustomer" />
  </div>
</template>
