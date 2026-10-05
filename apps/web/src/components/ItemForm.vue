<script setup lang="ts">
import { faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { ref } from "vue";
import { toast } from "vue-sonner";

import type { BookData } from "@livrelibre/server/utils/getBookData";
import { formatDate } from "@livrelibre/shared/date";
import { formatTVA } from "@livrelibre/shared/format";
import {
  ITEM_TYPES,
  type ItemType,
  type TVA,
  TVAValues,
} from "@livrelibre/shared/item";

import AppAlert from "@/components/AppAlert.vue";
import AppCard from "@/components/AppCard.vue";
import AppInput from "@/components/AppInput.vue";
import AppSelect from "@/components/AppSelect.vue";
import AppTextarea from "@/components/AppTextarea.vue";
import ButtonWithInput from "@/components/ButtonWithInput.vue";
import CardBody from "@/components/CardBody.vue";
import CardFooter from "@/components/CardFooter.vue";
import CardTitle from "@/components/CardTitle.vue";
import FormRow from "@/components/FormRow.vue";
import InputWithButton from "@/components/InputWithButton.vue";
import { getErrorMessage } from "@/utils/errors";

import type { AlertMessage } from "./form";
import type { FormFields, ItemFormResult } from "./itemForm";

const props = defineProps<{
  title: string;
  data?: FormFields | undefined;
  onSubmit: (data: FormFields) => Promise<ItemFormResult>;
}>();

const type = ref<ItemType>(props.data?.type ?? "book");
const isbn = ref(props.data?.isbn ?? "");
const author = ref(props.data?.author ?? "");
const title = ref(props.data?.title ?? "");
const publisher = ref(props.data?.publisher ?? "");
const distributor = ref(props.data?.distributor ?? "");
const keywords = ref(props.data?.keywords ?? "");
const datebought = ref(props.data?.datebought ?? formatDate(new Date()));
const comments = ref(props.data?.comments ?? "");
const price = ref<string | number>(props.data?.price ?? "");
const amount = ref<string | number>(props.data?.amount ?? "0");
const tva = ref<TVA>(props.data?.tva ?? "5.5");

const alert = ref<AlertMessage | null>(null);
const isbnLoading = ref(false);

const reset = () => {
  type.value = "book";
  isbn.value = "";
  author.value = "";
  title.value = "";
  publisher.value = "";
  distributor.value = "";
  keywords.value = "";
  datebought.value = formatDate(new Date());
  comments.value = "";
  price.value = "";
  amount.value = "0";
  tva.value = "5.5";
};

const buildPayload = (): FormFields => ({
  type: type.value,
  isbn: isbn.value,
  author: author.value,
  title: title.value,
  publisher: publisher.value,
  distributor: distributor.value,
  keywords: keywords.value,
  datebought: datebought.value,
  comments: comments.value,
  price: String(price.value),
  amount: String(amount.value),
  tva: tva.value,
});

const submit = async () => {
  try {
    const { type: resultType, msg: message } =
      await props.onSubmit(buildPayload());
    alert.value = { type: resultType, message };
    if (resultType === "success" && props.data === undefined) {
      reset();
    }
  } catch (error) {
    alert.value = { type: "error", message: getErrorMessage(error) };
  }
};

const isbnSearch = async () => {
  const value = isbn.value;
  if (!value || !/^\d{10,13}$/.test(value)) return;
  const response = await fetch(`/api/book/${value}`);
  if (!response.ok) {
    throw new Error(String(response.status));
  }
  const data = (await response.json()) as BookData;
  title.value = data.title;
  author.value = data.author;
  publisher.value = data.publisher;
};

const isbnHandler = async () => {
  isbnLoading.value = true;
  try {
    await isbnSearch();
  } catch (error) {
    if (error instanceof Error && error.message === "404") {
      toast.warning("Aucun résultat pour cet ISBN");
    } else {
      toast.error("Impossible de récupérer les données");
    }
  } finally {
    isbnLoading.value = false;
  }
};
</script>

<template>
  <AppCard class="max-h-full flex flex-col">
    <CardTitle>{{ props.title }}</CardTitle>
    <form class="flex-1 flex flex-col h-0" @submit.prevent="submit">
      <CardBody class="flex-col gap-5">
        <div class="flex flex-wrap">
          <div class="flex-1 [min-width:20rem] ml-md">
            <FormRow label="Type">
              <AppSelect v-model="type">
                <option
                  v-for="[key, label] in Object.entries(ITEM_TYPES)"
                  :key="key"
                  :value="key"
                >
                  {{ label }}
                </option>
              </AppSelect>
            </FormRow>
            <FormRow label="ISBN" group>
              <InputWithButton
                v-model="isbn"
                type="text"
                aria-label="ISBN"
                :maxlength="13"
                @keydown.enter.prevent="isbnLoading ? undefined : isbnHandler()"
              />
              <ButtonWithInput
                type="button"
                aria-label="Chercher les infos pour cet ISBN"
                @click="isbnHandler"
              >
                <FontAwesomeIcon
                  :icon="isbnLoading ? faSpinner : faSearch"
                  :spin="isbnLoading"
                  class="mx-sm"
                />
              </ButtonWithInput>
            </FormRow>
            <FormRow label="Auteur·ice">
              <AppInput v-model="author" type="text" />
            </FormRow>
            <FormRow label="Titre">
              <AppInput v-model="title" type="text" required />
            </FormRow>
            <FormRow label="Maison d'édition">
              <AppInput v-model="publisher" type="text" />
            </FormRow>
            <FormRow label="Distributeur">
              <AppInput v-model="distributor" type="text" />
            </FormRow>
            <FormRow label="Mots-clés">
              <AppInput v-model="keywords" type="text" />
            </FormRow>
          </div>
          <div class="flex-1 [min-width:20rem] ml-md">
            <FormRow label="Date d’achat">
              <AppInput v-model="datebought" type="date" />
            </FormRow>
            <FormRow label="Commentaires">
              <AppTextarea v-model="comments" />
            </FormRow>
            <FormRow label="Prix de vente">
              <AppInput
                v-model="price"
                type="number"
                :step="0.01"
                required
                class="font-number"
              />
            </FormRow>
            <FormRow label="Quantité">
              <AppInput
                v-model="amount"
                type="number"
                :min="0"
                class="font-number"
              />
            </FormRow>
            <FormRow label="TVA">
              <AppSelect v-model="tva" class="font-number">
                <option v-for="value in TVAValues" :key="value" :value="value">
                  {{ formatTVA(value) }}
                </option>
              </AppSelect>
            </FormRow>
          </div>
        </div>
      </CardBody>
      <CardFooter>
        <div class="flex justify-end mb-sm">
          <slot />
        </div>
        <AppAlert v-if="alert" :type="alert.type" @dismiss="alert = null">
          {{ alert.message }}
        </AppAlert>
      </CardFooter>
    </form>
  </AppCard>
</template>
