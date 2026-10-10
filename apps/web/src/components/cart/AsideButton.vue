<script setup lang="ts">
import { faHourglassStart, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";

import AppButton from "@/components/AppButton.vue";
import { trpcClient } from "@/utils/trpc";

const queryClient = useQueryClient();
const { data: asideCart, isSuccess: asideCartSuccess } = useQuery({
  queryKey: ["asideCart"],
  queryFn: () => trpcClient.asideCart.query(),
});
const { mutate, isPending } = useMutation({
  mutationFn: () => trpcClient.putCartAside.mutate(),
  onSuccess() {
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: ["cart"] }),
      queryClient.invalidateQueries({ queryKey: ["asideCart"] }),
    ]);
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
      <FontAwesomeIcon :icon="isPending ? faSpinner : faHourglassStart" :spin="isPending" />
      <span class="ml-sm">Mettre de côté</span>
    </AppButton>
  </form>
</template>
