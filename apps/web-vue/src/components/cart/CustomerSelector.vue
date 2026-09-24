<script setup lang="ts">
import { faEdit, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { toast } from "vue-sonner";

import Button from "@/components/Button.vue";
import LinkButton from "@/components/LinkButton.vue";
import SelectCustomer from "@/components/SelectCustomer.vue";
import type { CustomerSelection } from "@/components/orderForm";
import { getErrorMessage } from "@/utils/errors";
import { useTRPCMutation, useTRPCQuery, useTRPCUtils } from "@/utils/query";

import CustomerInfos from "./CustomerInfos.vue";

const result = useTRPCQuery("selectedCustomer", undefined);
const utils = useTRPCUtils();
const mutation = useTRPCMutation("selectCustomer", {
  meta: { errorToast: false },
  onSuccess() {
    void utils.invalidate("selectedCustomer");
  },
  onError(error) {
    toast.error(getErrorMessage(error));
  },
});

const onSelect = (customer: CustomerSelection | null) => {
  mutation.mutate({ asideCart: false, customerId: customer?.id ?? null });
};
</script>

<template>
  <div v-if="result.isSuccess.value">
    <div class="flex gap-1">
      <SelectCustomer
        :customer="result.data.value ?? null"
        placeholder="Associer un⋅e client⋅e…"
        @update:customer="onSelect"
      />
      <template v-if="result.data.value">
        <LinkButton
          :to="`/customer/${String(result.data.value.id)}`"
          title="Modifier"
        >
          <FontAwesomeIcon :icon="faEdit" />
        </LinkButton>
        <Button type="button" title="Dissocier" @click="onSelect(null)">
          <FontAwesomeIcon :icon="faTimesCircle" />
        </Button>
      </template>
    </div>
    <CustomerInfos v-if="result.data.value" :customer="result.data.value" />
  </div>
</template>
