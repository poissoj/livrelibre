<script setup lang="ts">
import type { CustomerWithPurchase } from "@livrelibre/shared/customer";
import { formatPrice } from "@livrelibre/shared/format";
import { LOYALTY_DISCOUNT_TITLE, loyaltyDiscount } from "@livrelibre/shared/sale";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { computed, ref } from "vue";
import { toast } from "vue-sonner";

import AppButton from "@/components/AppButton.vue";
import AppInput from "@/components/AppInput.vue";
import { getErrorMessage } from "@/utils/errors";
import { type RouterInput, trpcClient } from "@/utils/trpc";

const props = defineProps<{ customer: CustomerWithPurchase }>();

const queryClient = useQueryClient();
const amount = computed(() =>
  props.customer.purchases.reduce((sum, purchase) => sum + purchase.amount, 0),
);
const discount = ref(loyaltyDiscount(amount.value));
const applied = ref<number | undefined>(undefined);

const { mutate: addDiscount, isPending: isApplying } = useMutation({
  mutationFn: (input: RouterInput["addNewItemToCart"]) => trpcClient.addNewItemToCart.mutate(input),
  meta: { errorToast: false },
  onSuccess() {
    applied.value = discount.value;
    void queryClient.invalidateQueries({ queryKey: ["cart"] });
  },
  onError(error) {
    toast.error(getErrorMessage(error));
  },
});

const onSubmit = () => {
  addDiscount({
    price: String(-discount.value),
    title: LOYALTY_DISCOUNT_TITLE,
    kind: "loyaltyDiscount",
    type: "book",
    tva: "5.5",
  });
};
</script>

<template>
  <div>
    <div v-if="props.customer.comment">{{ props.customer.comment }}</div>
    <div>
      {{ props.customer.purchases.length }} achat{{
        props.customer.purchases.length > 1 ? "s" : ""
      }}, total {{ formatPrice(amount) }}
    </div>
    <form v-if="applied === undefined" @submit.prevent="onSubmit">
      Remise possible:
      <AppInput
        :model-value="discount"
        type="number"
        :step="0.01"
        :min="0"
        class="ml-2 !w-28 font-number"
        @update:model-value="(value) => (discount = Number(value))"
      />
      <AppButton type="submit" class="ml-2" :disabled="isApplying"> Appliquer </AppButton>
    </form>
    <div v-else>Remise de {{ formatPrice(applied) }} appliquée</div>
  </div>
</template>
