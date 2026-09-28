<script setup lang="ts">
import { faEdit, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { toast } from "vue-sonner";

import AppButton from "@/components/AppButton.vue";
import LinkButton from "@/components/LinkButton.vue";
import SelectCustomer from "@/components/SelectCustomer.vue";
import type { CustomerSelection } from "@/components/orderForm";
import { getErrorMessage } from "@/utils/errors";
import { useTRPCMutation, useTRPCQuery, useTRPCUtils } from "@/utils/query";

import CustomerInfos from "./CustomerInfos.vue";

const { data: selectedCustomer, isSuccess } = useTRPCQuery(
  "selectedCustomer",
  undefined,
);
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
  <div v-if="isSuccess">
    <div class="flex gap-1">
      <SelectCustomer
        :customer="selectedCustomer ?? null"
        placeholder="Associer un⋅e client⋅e…"
        @update:customer="onSelect"
      />
      <template v-if="selectedCustomer">
        <LinkButton
          :to="`/customer/${String(selectedCustomer.id)}`"
          title="Modifier"
        >
          <FontAwesomeIcon :icon="faEdit" />
        </LinkButton>
        <AppButton type="button" title="Dissocier" @click="onSelect(null)">
          <FontAwesomeIcon :icon="faTimesCircle" />
        </AppButton>
      </template>
    </div>
    <CustomerInfos v-if="selectedCustomer" :customer="selectedCustomer" />
  </div>
</template>
