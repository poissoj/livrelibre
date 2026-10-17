<script setup lang="ts">
import { faShareSquare, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";

import AppButton from "@/components/AppButton.vue";
import { cartQueryOptions } from "@/lib/queries";
import { queryKeys } from "@/lib/queryKeys";
import { trpcClient } from "@/utils/trpc";

const queryClient = useQueryClient();
const { data: cart, isSuccess: cartSuccess } = useQuery(cartQueryOptions());
const { mutate, isPending } = useMutation({
  mutationFn: () => trpcClient.reactivateCart.mutate(),
  onSuccess() {
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.root }),
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.aside }),
    ]);
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
