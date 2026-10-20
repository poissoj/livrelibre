<script setup lang="ts">
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { formatDate } from "@livrelibre/shared/date";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { ref, watch } from "vue";

import AppButton from "@/components/AppButton.vue";
import AppInput from "@/components/AppInput.vue";
import AppSelect from "@/components/AppSelect.vue";
import { queryKeys } from "@/lib/queryKeys";
import usePaymentMethods from "@/lib/usePaymentMethods";
import { type RouterInput, trpcClient } from "@/utils/trpc";

const queryClient = useQueryClient();
const { activeMethods, defaultCode } = usePaymentMethods();
const paymentDate = ref(formatDate(new Date()));
const paymentType = ref("");

watch(
  [activeMethods, defaultCode],
  () => {
    const isAvailable = activeMethods.value.some((method) => method.code === paymentType.value);
    if (!isAvailable) {
      paymentType.value = defaultCode.value || activeMethods.value[0]?.code || "";
    }
  },
  { immediate: true },
);

const { mutateAsync: payCart, isPending: isPaying } = useMutation({
  mutationFn: (input: RouterInput["payCart"]) => trpcClient.payCart.mutate(input),
  onSuccess() {
    void queryClient.invalidateQueries({ queryKey: queryKeys.cart.root });
    void queryClient.invalidateQueries({ queryKey: queryKeys.customers.root });
    void queryClient.invalidateQueries({ queryKey: queryKeys.cart.selectedCustomer });
    void queryClient.invalidateQueries({ queryKey: queryKeys.customers.searchRoot });
  },
});

const onSubmit = async () => {
  try {
    await payCart({
      paymentDate: paymentDate.value,
      paymentType: paymentType.value,
    });
  } catch {
    // Handled by the global mutation error handler.
  }
};
</script>

<template>
  <form class="flex justify-end gap-sm" @submit.prevent="onSubmit">
    <label for="paymentDate" class="self-center cursor-pointer">Date</label>
    <AppInput id="paymentDate" v-model="paymentDate" type="date" class="w-min" />
    <AppSelect
      v-model="paymentType"
      class="w-min"
      :disabled="activeMethods.length === 0"
      aria-label="Moyen de paiement"
    >
      <option v-for="method in activeMethods" :key="method.code" :value="method.code">
        {{ method.label }}
      </option>
    </AppSelect>
    <AppButton type="submit" class="[padding:10px_15px]" :disabled="isPaying || !paymentType">
      <FontAwesomeIcon :icon="faCheckCircle" />
      <span class="ml-sm">Payer</span>
    </AppButton>
  </form>
</template>
