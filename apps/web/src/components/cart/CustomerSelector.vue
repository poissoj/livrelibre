<script setup lang="ts">
import { faEdit, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { toast } from "vue-sonner";

import AppAlert from "@/components/AppAlert.vue";
import AppButton from "@/components/AppButton.vue";
import LinkButton from "@/components/LinkButton.vue";
import type { CustomerSelection } from "@/components/orderForm";
import SelectCustomer from "@/components/SelectCustomer.vue";
import { getErrorMessage } from "@/utils/errors";
import { useTRPCMutation, useTRPCQuery, useTRPCUtils } from "@/utils/query";

import CustomerInfos from "./CustomerInfos.vue";

const { data: selectedCustomer, isSuccess, isError } = useTRPCQuery("selectedCustomer", undefined);
const utils = useTRPCUtils();
const { mutate: selectCustomer } = useTRPCMutation("selectCustomer", {
  meta: { errorToast: false },
  onSuccess() {
    void utils.invalidate("selectedCustomer");
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
