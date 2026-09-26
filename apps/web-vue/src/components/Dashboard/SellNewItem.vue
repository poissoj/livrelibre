<script setup lang="ts">
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { ref } from "vue";

import { formatTVA } from "@livrelibre/shared/format";
import {
  ITEM_TYPES,
  type ItemType,
  type TVA,
  TVAValues,
} from "@livrelibre/shared/item";

import Alert from "@/components/Alert.vue";
import Button from "@/components/Button.vue";
import Card from "@/components/Card.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import FormRow from "@/components/FormRow.vue";
import Input from "@/components/Input.vue";
import Select from "@/components/Select.vue";
import { getErrorMessage } from "@/utils/errors";
import { useTRPCMutation, useTRPCUtils } from "@/utils/query";

type TAlert = {
  type: "success" | "error";
  message: string;
};

const utils = useTRPCUtils();
const price = ref<string | number>("");
const title = ref("");
const type = ref<ItemType>("book");
const tva = ref<TVA>("5.5");
const alert = ref<TAlert | null>(null);

const { mutateAsync: addItem, isPending: addPending } = useTRPCMutation(
  "addNewItemToCart",
  {
    meta: { errorToast: false },
    async onSuccess() {
      await utils.invalidate("cart");
    },
    onError(error) {
      alert.value = { type: "error", message: getErrorMessage(error) };
    },
  },
);

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
    type.value = "book";
    tva.value = "5.5";
    alert.value = { type: "success", message: "Article ajouté au panier" };
  } catch {
    // handled by onError
  }
};
</script>

<template>
  <Card class="mb-lg">
    <CardTitle>Vendre un article non répertorié</CardTitle>
    <CardBody class="flex-col gap-4">
      <form class="flex flex-col flex-1" @submit.prevent="onSubmit">
        <FormRow label="Prix">
          <Input
            v-model="price"
            type="number"
            class="font-number"
            :step="0.01"
            required
          />
        </FormRow>
        <FormRow label="Titre">
          <Input
            v-model="title"
            type="text"
            placeholder="Article indépendant"
          />
        </FormRow>
        <FormRow label="Type">
          <Select v-model="type">
            <option
              v-for="[key, label] in Object.entries(ITEM_TYPES)"
              :key="key"
              :value="key"
            >
              {{ label }}
            </option>
          </Select>
        </FormRow>
        <FormRow label="TVA">
          <Select v-model="tva" class="font-number">
            <option v-for="value in TVAValues" :key="value" :value="value">
              {{ formatTVA(value) }}
            </option>
          </Select>
        </FormRow>
        <Button type="submit" class="self-center" :disabled="addPending">
          <FontAwesomeIcon :icon="faCartPlus" class="mr-sm" />
          Ajouter au panier
        </Button>
      </form>
      <Alert v-if="alert" :type="alert.type" @dismiss="alert = null">
        {{ alert.message }}
      </Alert>
    </CardBody>
  </Card>
</template>
