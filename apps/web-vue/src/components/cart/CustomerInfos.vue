<script setup lang="ts">
import { computed, ref } from "vue";
import { toast } from "vue-sonner";

import type { CustomerWithPurchase } from "@livrelibre/shared/customer";
import { formatPrice } from "@livrelibre/shared/format";

import AppButton from "@/components/AppButton.vue";
import AppInput from "@/components/AppInput.vue";
import { getErrorMessage } from "@/utils/errors";
import { useTRPCMutation, useTRPCUtils } from "@/utils/query";

const props = defineProps<{ customer: CustomerWithPurchase }>();

const utils = useTRPCUtils();
const amount = computed(() =>
  props.customer.purchases.reduce((sum, purchase) => sum + purchase.amount, 0),
);
const discount = ref(Math.round(amount.value * 3) / 100);
const applied = ref<number | undefined>(undefined);

const { mutate: addDiscount, isPending: isApplying } = useTRPCMutation(
  "addNewItemToCart",
  {
    meta: { errorToast: false },
    onSuccess() {
      applied.value = discount.value;
      void utils.invalidate("cart");
    },
    onError(error) {
      toast.error(getErrorMessage(error));
    },
  },
);

const onSubmit = () => {
  addDiscount({
    price: String(-discount.value),
    title: "Remise carte de fidélité",
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
      <AppButton type="submit" class="ml-2" :disabled="isApplying">
        Appliquer
      </AppButton>
    </form>
    <div v-else>Remise de {{ formatPrice(applied) }} appliquée</div>
  </div>
</template>
