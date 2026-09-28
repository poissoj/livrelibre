<script setup lang="ts">
import { faHourglassStart, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import AppButton from "@/components/AppButton.vue";
import { useTRPCMutation, useTRPCQuery, useTRPCUtils } from "@/utils/query";

const utils = useTRPCUtils();
const { data: asideCart, isSuccess: asideCartSuccess } = useTRPCQuery(
  "asideCart",
  undefined,
);
const { mutate, isPending } = useTRPCMutation("putCartAside", {
  onSuccess() {
    void Promise.all([utils.invalidate("cart"), utils.invalidate("asideCart")]);
  },
});

const submit = () => {
  mutate();
};
</script>

<template>
  <form v-if="asideCartSuccess" @submit.prevent="submit">
    <AppButton
      type="submit"
      class="[padding:10px_15px]"
      value="put-aside"
      :disabled="isPending || (asideCart?.count ?? 0) > 0"
    >
      <FontAwesomeIcon
        :icon="isPending ? faSpinner : faHourglassStart"
        :spin="isPending"
      />
      <span class="ml-sm">Mettre de côté</span>
    </AppButton>
  </form>
</template>
