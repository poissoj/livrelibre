<script setup lang="ts">
import { faSpinner, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useMutation, useQueryClient } from "@tanstack/vue-query";

import AppButton from "@/components/AppButton.vue";
import { type RouterInput, trpcClient } from "@/utils/trpc";

const props = defineProps<{ id: number }>();

const queryClient = useQueryClient();
const { mutate, isPending } = useMutation({
  mutationFn: (input: RouterInput["removeFromCart"]) => trpcClient.removeFromCart.mutate(input),
  onSuccess() {
    void queryClient.invalidateQueries({ queryKey: ["cart"] });
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
    <FontAwesomeIcon :icon="isPending ? faSpinner : faTrashAlt" :spin="isPending" />
  </AppButton>
</template>
