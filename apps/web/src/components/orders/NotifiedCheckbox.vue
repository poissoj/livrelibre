<script setup lang="ts">
import type { OrderRow } from "@livrelibre/shared/order";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

import { type RouterInput, type RouterOutput, trpcClient } from "@/utils/trpc";

const props = defineProps<{ order: OrderRow }>();

const queryClient = useQueryClient();
const { mutate: setNotified, isPending: isUpdating } = useMutation({
  mutationFn: (input: RouterInput["setCustomerNotified"]) =>
    trpcClient.setCustomerNotified.mutate(input),
  onSuccess(_data, variables) {
    toast.success(
      `La commande de "${props.order.itemTitle}" a été marquée comme ${
        variables.customerNotified ? "" : "non "
      }prévenue.`,
    );
    queryClient.setQueryData<RouterOutput["order"]>(["order", props.order.id], (oldData) =>
      oldData ? { ...oldData, customerNotified: variables.customerNotified } : undefined,
    );
    void queryClient.invalidateQueries({ queryKey: ["orders"] });
  },
});

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
    aria-label="Commande prévenue"
    :checked="props.order.customerNotified"
    :disabled="isUpdating"
    @change="toggle"
  />
</template>
