<script setup lang="ts">
import { faSpinner, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import AppButton from "@/components/AppButton.vue";
import { useTRPCMutation, useTRPCUtils } from "@/utils/query";

const props = defineProps<{ id: number }>();

const utils = useTRPCUtils();
const { mutate, isPending } = useTRPCMutation("removeFromCart", {
  onSuccess() {
    void utils.invalidate("cart");
  },
});
</script>

<template>
  <AppButton
    type="button"
    class="!bg-warning"
    aria-label="Enlever du panier"
    title="Enlever du panier"
    @click="mutate(props.id)"
  >
    <FontAwesomeIcon
      :icon="isPending ? faSpinner : faTrashAlt"
      :spin="isPending"
    />
  </AppButton>
</template>
