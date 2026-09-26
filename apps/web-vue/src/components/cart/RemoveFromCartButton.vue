<script setup lang="ts">
import { faSpinner, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import Button from "@/components/Button.vue";
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
  <Button
    type="button"
    class="!bg-warning"
    title="Enlever du panier"
    @click="mutate(props.id)"
  >
    <FontAwesomeIcon
      :icon="isPending ? faSpinner : faTrashAlt"
      :spin="isPending"
    />
  </Button>
</template>
