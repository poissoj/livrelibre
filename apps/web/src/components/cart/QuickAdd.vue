<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { nextTick, onMounted, ref, useTemplateRef } from "vue";

import AppInput from "@/components/AppInput.vue";
import { refreshCartRelated } from "@/utils/invalidations";
import { type RouterInput, trpcClient } from "@/utils/trpc";

import type { ISBNError } from "./types";

const emit = defineEmits<{ error: [value: ISBNError] }>();

const queryClient = useQueryClient();
const isbn = ref("");
const inputRef = useTemplateRef<InstanceType<typeof AppInput>>("inputRef");

const focusInput = () => {
  void nextTick(() => {
    inputRef.value?.focus();
  });
};
onMounted(focusInput);

const { mutate: addIsbn } = useMutation({
  mutationFn: (input: RouterInput["addISBNToCart"]) => trpcClient.addISBNToCart.mutate(input),
  meta: { errorToast: false },
  onError(_error, isbnInput) {
    emit("error", { message: "INTERNAL_ERROR", isbn: isbnInput });
  },
  async onSuccess(data, isbnInput) {
    if (data.errorCode) {
      const { errorCode: message, ...rest } = data;
      emit("error", { message, isbn: isbnInput, ...rest });
      return;
    }
    await refreshCartRelated(queryClient);
  },
});

const submit = () => {
  if (!isbn.value) return;
  addIsbn(isbn.value);
  isbn.value = "";
  focusInput();
};
</script>

<template>
  <form class="flex items-center" @submit.prevent="submit">
    <label for="isbn-field" class="shrink-0 mr-2">Ajout rapide :</label>
    <AppInput
      id="isbn-field"
      ref="inputRef"
      v-model="isbn"
      type="text"
      placeholder="ISBN"
      :maxlength="13"
      class="!w-40"
    />
  </form>
</template>
