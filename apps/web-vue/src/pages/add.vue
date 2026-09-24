<script setup lang="ts">
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import Button from "@/components/Button.vue";
import ItemForm from "@/components/ItemForm.vue";
import Title from "@/components/Title.vue";
import type { FormFields } from "@/components/itemForm";
import { useTRPCMutation } from "@/utils/query";

const mutation = useTRPCMutation("addItem", { meta: { errorToast: false } });

const submit = async (data: FormFields) => {
  const datebought = data.datebought.split("-").reverse().join("/");
  const item = { ...data, amount: Number(data.amount), datebought };
  return await mutation.mutateAsync(item);
};
</script>

<template>
  <div class="[margin-left:10%] [margin-right:10%] flex-1">
    <Title>Ajouter un article</Title>
    <ItemForm title="Ajouter un article" :on-submit="submit">
      <Button type="submit" class="px-md" :disabled="mutation.isPending.value">
        <FontAwesomeIcon :icon="faPlus" class="mr-sm" />
        Ajouter
      </Button>
    </ItemForm>
  </div>
</template>
