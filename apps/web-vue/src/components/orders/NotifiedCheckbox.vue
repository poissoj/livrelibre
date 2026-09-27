<script setup lang="ts">
import { toast } from "vue-sonner";

import type { OrderRow } from "@livrelibre/shared/order";

import { useTRPCMutation, useTRPCUtils } from "@/utils/query";

const props = defineProps<{ order: OrderRow }>();

const utils = useTRPCUtils();
const { mutate: setNotified, isPending: isUpdating } = useTRPCMutation(
  "setCustomerNotified",
  {
    onSuccess(_data, variables) {
      toast.success(
        `La commande de "${props.order.itemTitle}" a été marquée comme ${
          variables.customerNotified ? "" : "non "
        }prévenue.`,
      );
      utils.setData("order", props.order.id, (oldData) =>
        oldData
          ? { ...oldData, customerNotified: variables.customerNotified }
          : undefined,
      );
      void utils.invalidate("orders");
    },
  },
);

const toggle = () => {
  setNotified({
    orderId: props.order.id,
    customerNotified: !props.order.customerNotified,
  });
};
</script>

<template>
  <input
    type="checkbox"
    :checked="props.order.customerNotified"
    :disabled="isUpdating"
    @change="toggle"
  />
</template>
