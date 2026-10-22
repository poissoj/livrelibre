<script setup lang="ts">
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { formatTVA } from "@livrelibre/shared/format";
import { type ItemType, type TVA, TVAValues } from "@livrelibre/shared/item";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { ref, watch } from "vue";

import AppAlert from "@/components/AppAlert.vue";
import AppButton from "@/components/AppButton.vue";
import AppCard from "@/components/AppCard.vue";
import AppInput from "@/components/AppInput.vue";
import AppSelect from "@/components/AppSelect.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import type { AlertMessage } from "@/components/form";
import FormRow from "@/components/FormRow.vue";
import useItemTypes from "@/lib/useItemTypes";
import { getErrorMessage } from "@/utils/errors";
import { refreshCartRelated } from "@/utils/invalidations";
import { type RouterInput, trpcClient } from "@/utils/trpc";

const queryClient = useQueryClient();
const { activeTypes, defaultCode, tva: tvaForType } = useItemTypes();
const price = ref<string | number>("");
const title = ref("");
const type = ref<ItemType>("");
const tva = ref<TVA>("5.5");
const alert = ref<AlertMessage | null>(null);

// Changer de type pré-remplit la TVA avec celle du type (modifiable ensuite).
watch(type, (code) => {
  const value = tvaForType(code);
  if (value) tva.value = value;
});
watch(
  defaultCode,
  (code) => {
    if (!type.value && code) {
      type.value = code;
    }
  },
  { immediate: true },
);

const { mutateAsync: addItem, isPending: addPending } = useMutation({
  mutationFn: (input: RouterInput["addNewItemToCart"]) => trpcClient.addNewItemToCart.mutate(input),
  meta: { errorToast: false },
  async onSuccess() {
    await refreshCartRelated(queryClient);
  },
  onError(error) {
    alert.value = { type: "error", message: getErrorMessage(error) };
  },
});

const onSubmit = async () => {
  try {
    await addItem({
      price: String(price.value),
      title: title.value,
      type: type.value,
      tva: tva.value,
    });
    price.value = "";
    title.value = "";
    type.value = defaultCode.value;
    tva.value = "5.5";
    alert.value = { type: "success", message: "Article ajouté au panier" };
  } catch {
    // handled by onError
  }
};
</script>

<template>
  <AppCard class="mb-lg">
    <CardTitle>Vendre un article non répertorié</CardTitle>
    <CardBody class="flex-col gap-4">
      <form class="flex flex-col flex-1" @submit.prevent="onSubmit">
        <FormRow label="Prix">
          <AppInput v-model="price" type="number" class="font-number" :step="0.01" required />
        </FormRow>
        <FormRow label="Titre">
          <AppInput v-model="title" type="text" name="title" placeholder="Article indépendant" />
        </FormRow>
        <FormRow label="Type">
          <AppSelect v-model="type">
            <option v-for="itemType in activeTypes" :key="itemType.code" :value="itemType.code">
              {{ itemType.label }}
            </option>
          </AppSelect>
        </FormRow>
        <FormRow label="TVA">
          <AppSelect v-model="tva" class="font-number">
            <option v-for="value in TVAValues" :key="value" :value="value">
              {{ formatTVA(value) }}
            </option>
          </AppSelect>
        </FormRow>
        <AppButton type="submit" class="self-center" :disabled="addPending">
          <FontAwesomeIcon :icon="faCartPlus" class="mr-sm" />
          Ajouter au panier
        </AppButton>
      </form>
      <AppAlert v-if="alert" :type="alert.type" @dismiss="alert = null">
        {{ alert.message }}
      </AppAlert>
    </CardBody>
  </AppCard>
</template>
