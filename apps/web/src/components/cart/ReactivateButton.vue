<script setup lang="ts">
import { faShareSquare, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import AppButton from "@/components/AppButton.vue";
import { useTRPCMutation, useTRPCQuery, useTRPCUtils } from "@/utils/query";

const utils = useTRPCUtils();
const { data: cart, isSuccess: cartSuccess } = useTRPCQuery("cart", undefined);
const { mutate, isPending } = useTRPCMutation("reactivateCart", {
  onSuccess() {
    void Promise.all([utils.invalidate("cart"), utils.invalidate("asideCart")]);
  },
});

const submit = () => {
  mutate();
};
</script>

<template>
  <form v-if="cartSuccess" @submit.prevent="submit">
    <AppButton
      type="submit"
      class="[padding:10px_15px] mb-2"
      :disabled="(cart?.count ?? 0) > 0 || isPending"
    >
      <FontAwesomeIcon :icon="isPending ? faSpinner : faShareSquare" :spin="isPending" />
      <span class="ml-sm">Réactiver</span>
    </AppButton>
  </form>
</template>
