<script setup lang="ts">
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import AppButton from "@/components/AppButton.vue";
import type { FormFields } from "@/components/itemForm";
import ItemForm from "@/components/ItemForm.vue";
import { useTRPCMutation } from "@/utils/query";

const { mutateAsync: addItem, isPending: addPending } = useTRPCMutation("addItem", {
  meta: { errorToast: false },
});

const submit = async (data: FormFields) => {
  const item = { ...data, amount: Number(data.amount) };
  return await addItem(item);
};
</script>

<template>
  <div class="[margin-left:10%] [margin-right:10%] flex-1">
    <ItemForm title="Ajouter un article" :on-submit="submit">
      <AppButton type="submit" class="px-md" :disabled="addPending">
        <FontAwesomeIcon :icon="faPlus" class="mr-sm" />
        Ajouter
      </AppButton>
    </ItemForm>
  </div>
</template>
