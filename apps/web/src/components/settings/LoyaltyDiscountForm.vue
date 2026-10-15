<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { ref, watch } from "vue";
import { toast } from "vue-sonner";

import AppButton from "@/components/AppButton.vue";
import AppInput from "@/components/AppInput.vue";
import useSettings from "@/lib/useSettings";
import { trpcClient } from "@/utils/trpc";

const queryClient = useQueryClient();
const { loyaltyDiscountPercent } = useSettings();

const percent = ref<number | string>(loyaltyDiscountPercent.value);

watch(loyaltyDiscountPercent, (value) => {
  percent.value = value;
});

const { mutate: save, isPending } = useMutation({
  mutationFn: (value: number) =>
    trpcClient.updateSettings.mutate({ loyaltyDiscountPercent: value }),
  async onSuccess() {
    toast.success("Réglages enregistrés.");
    await queryClient.invalidateQueries({ queryKey: ["settings"] });
  },
});

const onSubmit = () => {
  save(Number(percent.value));
};
</script>

<template>
  <form class="flex flex-wrap items-center gap-sm" @submit.prevent="onSubmit">
    <label class="flex items-center gap-sm">
      <span>Pourcentage de remise fidélité (%)</span>
      <AppInput
        v-model="percent"
        type="number"
        :step="0.1"
        :min="0"
        :max="100"
        class="font-number w-20!"
      />
    </label>
    <AppButton type="submit" class="px-md" :disabled="isPending">Enregistrer</AppButton>
  </form>
</template>
