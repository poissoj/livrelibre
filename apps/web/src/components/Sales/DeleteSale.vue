<script setup lang="ts">
import { faSpinner, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useMutation, useQueryClient } from "@tanstack/vue-query";

import AppButton from "@/components/AppButton.vue";
import { type RouterInput, trpcClient } from "@/utils/trpc";

const props = defineProps<{ saleId: number }>();

const queryClient = useQueryClient();
const { mutate, isPending } = useMutation({
  mutationFn: (input: RouterInput["deleteSale"]) => trpcClient.deleteSale.mutate(input),
  onSuccess() {
    void queryClient.invalidateQueries({ queryKey: ["salesByDay"] });
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
    <FontAwesomeIcon :icon="isPending ? faSpinner : faTrashAlt" :spin="isPending" />
  </AppButton>
</template>
