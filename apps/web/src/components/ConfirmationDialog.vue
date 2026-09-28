<script setup lang="ts">
import { faTimesCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { ref } from "vue";

import AppButton from "./AppButton.vue";

const props = defineProps<{ title: string; message: string }>();
const emit = defineEmits<{ confirm: [] }>();

const isOpen = ref(false);
const close = () => {
  isOpen.value = false;
};
const confirm = () => {
  emit("confirm");
  close();
};
</script>

<template>
  <AppButton type="button" class="mr-auto !bg-danger" @click="isOpen = true">
    <FontAwesomeIcon :icon="faTrash" class="mr-sm" />
    Supprimer
  </AppButton>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative" @close="close">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      </TransitionChild>
      <div class="fixed inset-0 flex w-screen items-center justify-center p-4">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="scale-95"
          enter-to="scale-100"
          leave="ease-in duration-200"
          leave-from="scale-100"
          leave-to="scale-95"
        >
          <DialogPanel
            class="w-full max-w-lg space-y-4 bg-white p-8 rounded-xl"
          >
            <DialogTitle class="font-bold">{{ props.title }}</DialogTitle>
            <p>{{ props.message }}</p>
            <div class="flex">
              <AppButton type="button" class="!bg-danger" @click="confirm">
                <FontAwesomeIcon :icon="faTrash" class="mr-sm" />
                Oui, supprimer
              </AppButton>
              <AppButton
                type="button"
                class="ml-auto !bg-gray-medium"
                @click="close"
              >
                <FontAwesomeIcon :icon="faTimesCircle" class="mr-sm" />
                Non, annuler
              </AppButton>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
