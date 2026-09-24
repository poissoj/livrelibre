<script setup lang="ts">
import { ref } from "vue";

import { CART_ERRORS } from "@livrelibre/shared/errors";

import Input from "@/components/Input.vue";
import { useTRPCMutation, useTRPCUtils } from "@/utils/query";

import type { ISBNError } from "./types";

const emit = defineEmits<{ error: [value: ISBNError] }>();

const utils = useTRPCUtils();
const isbn = ref("");

const mutation = useTRPCMutation("addISBNToCart", {
  meta: { errorToast: false },
  onError(_error, isbnInput) {
    emit("error", { message: CART_ERRORS.INTERNAL_ERROR, isbn: isbnInput });
  },
  async onSuccess(data, isbnInput) {
    if (data.errorCode) {
      const { errorCode: message, ...rest } = data;
      emit("error", { message, isbn: isbnInput, ...rest });
      return;
    }
    await Promise.all([
      utils.invalidate("cart"),
      utils.invalidate("bookmarks"),
      utils.invalidate("quicksearch"),
      utils.invalidate("items"),
      utils.invalidate("advancedSearch"),
    ]);
  },
});

const submit = () => {
  if (!isbn.value) return;
  mutation.mutate(isbn.value);
  isbn.value = "";
};
</script>

<template>
  <form class="flex items-center" @submit.prevent="submit">
    <label for="isbn-field" class="shrink-0 mr-2">Ajout rapide :</label>
    <Input
      id="isbn-field"
      v-model="isbn"
      type="text"
      placeholder="ISBN"
      :maxlength="13"
      class="!w-40"
      autofocus
    />
  </form>
</template>
