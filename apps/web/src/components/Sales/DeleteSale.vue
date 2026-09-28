<script setup lang="ts">
import { faSpinner, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import AppButton from "@/components/AppButton.vue";
import { useTRPCMutation, useTRPCUtils } from "@/utils/query";

const props = defineProps<{ saleId: number }>();

const utils = useTRPCUtils();
const { mutate, isPending } = useTRPCMutation("deleteSale", {
  onSuccess() {
    void utils.invalidate("salesByDay");
  },
});
</script>

<template>
  <AppButton
    type="button"
    aria-label="Supprimer la vente"
    class="!bg-warning"
    title="Supprimer"
    @click="mutate({ saleId: props.saleId })"
  >
    <FontAwesomeIcon
      :icon="isPending ? faSpinner : faTrashAlt"
      :spin="isPending"
    />
  </AppButton>
</template>
