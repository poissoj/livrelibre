<script setup lang="ts">
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { clsx } from "clsx";
import { computed, ref } from "vue";
import { toast } from "vue-sonner";

import { formatDate } from "@livrelibre/shared/date";
import { PAYMENT_METHODS, type PaymentType } from "@livrelibre/shared/sale";

import Button from "@/components/Button.vue";
import Input from "@/components/Input.vue";
import Select from "@/components/Select.vue";
import { getErrorMessage } from "@/utils/errors";
import { useTRPCMutation, useTRPCUtils } from "@/utils/query";

const emit = defineEmits<{ change: [value: number | null] }>();

const utils = useTRPCUtils();
const paymentDate = ref(formatDate(new Date()));
const paymentType = ref<PaymentType>("cash");
const amount = ref<string | number>("");

const mutation = useTRPCMutation("payCart", {
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
});

const isCash = computed(() => paymentType.value === "cash");

const onSubmit = async () => {
  try {
    const res = await mutation.mutateAsync({
      paymentDate: paymentDate.value,
      paymentType: paymentType.value,
      amount: String(amount.value),
    });
    emit("change", res.change);
  } catch {
    // handled by onError
  }
};
</script>

<template>
  <form class="flex justify-end gap-sm" @submit.prevent="onSubmit">
    <label for="paymentDate" class="self-center cursor-pointer">Date</label>
    <Input id="paymentDate" v-model="paymentDate" type="date" class="w-min" />
    <Select v-model="paymentType" class="w-min">
      <option
        v-for="[value, label] in Object.entries(PAYMENT_METHODS)"
        :key="value"
        :value="value"
      >
        {{ label }}
      </option>
    </Select>
    <label for="cash" :class="clsx('sr-only', { hidden: !isCash })">
      Espèces
    </label>
    <Input
      id="cash"
      v-model="amount"
      type="number"
      :step="0.01"
      :min="0"
      :class="clsx('!w-28 font-number', { hidden: !isCash })"
    />
    <Button
      type="submit"
      class="[padding:10px_15px]"
      :disabled="mutation.isPending.value"
    >
      <FontAwesomeIcon :icon="faCheckCircle" />
      <span class="ml-sm">Payer</span>
    </Button>
  </form>
</template>
