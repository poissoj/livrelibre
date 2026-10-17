<script setup lang="ts">
import type { CustomerWithPurchase } from "@livrelibre/shared/customer";
import { formatPrice } from "@livrelibre/shared/format";
import { DISCOUNT_ITEM_TYPE } from "@livrelibre/shared/item";
import { LOYALTY_DISCOUNT_TITLE, loyaltyDiscount } from "@livrelibre/shared/sale";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, ref, watch } from "vue";

import AppButton from "@/components/AppButton.vue";
import AppInput from "@/components/AppInput.vue";
import { cartQueryOptions } from "@/lib/queries";
import useItemTypes from "@/lib/useItemTypes";
import useSettings from "@/lib/useSettings";
import { refreshCartRelated } from "@/utils/invalidations";
import { type RouterInput, trpcClient } from "@/utils/trpc";

const props = defineProps<{ customer: CustomerWithPurchase }>();

const queryClient = useQueryClient();
const { tva: tvaForType } = useItemTypes();
const { loyaltyDiscountPercent } = useSettings();
const amount = computed(() =>
  props.customer.purchases.reduce((sum, purchase) => sum + purchase.amount, 0),
);
const discount = ref(loyaltyDiscount(amount.value, loyaltyDiscountPercent.value));

const { data: cart } = useQuery(cartQueryOptions());
const discountItem = computed(() =>
  cart.value?.items.find((item) => item.title === LOYALTY_DISCOUNT_TITLE),
);
const applied = computed(() =>
  discountItem.value ? -Number(discountItem.value.price) : undefined,
);

watch(loyaltyDiscountPercent, (percent) => {
  if (applied.value === undefined) {
    discount.value = loyaltyDiscount(amount.value, percent);
  }
});

const { mutate: addDiscount, isPending: isApplying } = useMutation({
  mutationFn: (input: RouterInput["addNewItemToCart"]) => trpcClient.addNewItemToCart.mutate(input),
  async onSuccess() {
    await refreshCartRelated(queryClient);
  },
});

const onSubmit = () => {
  addDiscount({
    price: String(-discount.value),
    title: LOYALTY_DISCOUNT_TITLE,
    kind: "loyaltyDiscount",
    type: DISCOUNT_ITEM_TYPE,
    tva: tvaForType(DISCOUNT_ITEM_TYPE) ?? "5.5",
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
