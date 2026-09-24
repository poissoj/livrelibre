<script setup lang="ts">
import { faSpinner, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import Button from "@/components/Button.vue";
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
  <Button
    type="button"
    aria-label="Supprimer la vente"
    class="!bg-[#FF9800]"
    title="Supprimer"
    @click="mutate({ saleId: props.saleId })"
  >
    <FontAwesomeIcon
      :icon="isPending ? faSpinner : faTrashAlt"
      :spin="isPending"
    />
  </Button>
</template>
