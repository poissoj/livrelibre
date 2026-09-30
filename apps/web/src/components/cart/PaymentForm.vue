<script setup lang="ts">
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { ref } from "vue";
import { toast } from "vue-sonner";

import { formatDate } from "@livrelibre/shared/date";
import { PAYMENT_METHODS, type PaymentType } from "@livrelibre/shared/sale";

import AppButton from "@/components/AppButton.vue";
import AppInput from "@/components/AppInput.vue";
import AppSelect from "@/components/AppSelect.vue";
import { getErrorMessage } from "@/utils/errors";
import { useTRPCMutation, useTRPCUtils } from "@/utils/query";

const utils = useTRPCUtils();
const paymentDate = ref(formatDate(new Date()));
const paymentType = ref<PaymentType>("cash");

const { mutateAsync: payCart, isPending: isPaying } = useTRPCMutation(
  "payCart",
  {
    meta: { errorToast: false },
    onSuccess() {
      void utils.invalidate("cart");
      void utils.invalidate("customers");
      void utils.invalidate("selectedCustomer");
      void utils.invalidate("searchCustomer");
    },
    onError(error) {
      toast.error(getErrorMessage(error));
    },
  },
);

const onSubmit = async () => {
  try {
    await payCart({
      paymentDate: paymentDate.value,
      paymentType: paymentType.value,
    });
  } catch {
    // handled by onError
  }
};
</script>

<template>
  <form class="flex justify-end gap-sm" @submit.prevent="onSubmit">
    <label for="paymentDate" class="self-center cursor-pointer">Date</label>
    <AppInput
      id="paymentDate"
      v-model="paymentDate"
      type="date"
      class="w-min"
    />
    <AppSelect v-model="paymentType" class="w-min">
      <option
        v-for="[value, label] in Object.entries(PAYMENT_METHODS)"
        :key="value"
        :value="value"
      >
        {{ label }}
      </option>
    </AppSelect>
    <AppButton type="submit" class="[padding:10px_15px]" :disabled="isPaying">
      <FontAwesomeIcon :icon="faCheckCircle" />
      <span class="ml-sm">Payer</span>
    </AppButton>
  </form>
</template>
