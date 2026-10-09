<script setup lang="ts">
import { nextTick, onMounted, ref, useTemplateRef } from "vue";

import AppInput from "@/components/AppInput.vue";
import { refreshCartRelated } from "@/utils/invalidations";
import { useTRPCMutation, useTRPCUtils } from "@/utils/query";

import type { ISBNError } from "./types";

const emit = defineEmits<{ error: [value: ISBNError] }>();

const utils = useTRPCUtils();
const isbn = ref("");
const inputRef = useTemplateRef<InstanceType<typeof AppInput>>("inputRef");

const focusInput = () => {
  void nextTick(() => {
    inputRef.value?.focus();
  });
};
onMounted(focusInput);

const { mutate: addIsbn } = useTRPCMutation("addISBNToCart", {
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
    await refreshCartRelated(utils);
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
