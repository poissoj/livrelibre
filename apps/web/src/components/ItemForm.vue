<script setup lang="ts">
import { faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { formatDate } from "@livrelibre/shared/date";
import { formatTVA } from "@livrelibre/shared/format";
import { TVAValues } from "@livrelibre/shared/item";
import { reactive, ref, watch } from "vue";
import { toast } from "vue-sonner";

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
import useItemTypes from "@/lib/useItemTypes";
import { formatValidationIssues, getErrorMessage } from "@/utils/errors";
import { isBookData } from "@/utils/guards";

import type { AlertMessage } from "./form";
import { type FormFields, type ItemFormResult, zItemForm } from "./itemForm";

const props = defineProps<{
  title: string;
  data?: FormFields | undefined;
  onSubmit: (data: FormFields) => Promise<ItemFormResult>;
}>();

const { activeTypes, defaultCode, tva: tvaForType } = useItemTypes();

type ItemFormState = Omit<FormFields, "price" | "amount"> & {
  price: string | number;
  amount: string | number;
};

const createEmptyState = (): ItemFormState => {
  const type = defaultCode.value;
  return {
    type,
    isbn: "",
    author: "",
    title: "",
    publisher: "",
    distributor: "",
    keywords: "",
    datebought: formatDate(new Date()),
    comments: "",
    price: "",
    amount: "0",
    tva: tvaForType(type) ?? "5.5",
  };
};

const form = reactive<ItemFormState>(props.data ? { ...props.data } : createEmptyState());

// Changer de type pré-remplit la TVA avec celle du type (modifiable ensuite).
watch(
  () => form.type,
  (code) => {
    const value = tvaForType(code);
    if (value) form.tva = value;
  },
);
watch(
  defaultCode,
  (code) => {
    if (!form.type && code) {
      form.type = code;
    }
  },
  { immediate: true },
);

const alert = ref<AlertMessage | null>(null);
const isbnLoading = ref(false);

const reset = () => {
  Object.assign(form, createEmptyState());
};

const buildPayload = (): FormFields => ({
  ...form,
  price: String(form.price),
  amount: String(form.amount),
});

const submit = async () => {
  const parsed = zItemForm.safeParse(buildPayload());
  if (!parsed.success) {
    alert.value = { type: "error", message: formatValidationIssues(parsed.error.issues) };
    return;
  }
  try {
    const { type: resultType, msg: message } = await props.onSubmit(buildPayload());
    alert.value = { type: resultType, message };
    if (resultType === "success" && props.data === undefined) {
      reset();
    }
  } catch (error) {
    alert.value = { type: "error", message: getErrorMessage(error) };
  }
};

const isbnSearch = async () => {
  const value = form.isbn;
  if (!value || !/^\d{10,13}$/.test(value)) return;
  const response = await fetch(`/api/book/${value}`);
  if (!response.ok) {
    throw new Error(String(response.status));
  }
  const parsed: unknown = await response.json();
  if (!isBookData(parsed)) {
    throw new Error("Réponse serveur invalide");
  }
  form.title = parsed.title;
  form.author = parsed.author;
  form.publisher = parsed.publisher;
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
    <CardTitle :level="1">{{ props.title }}</CardTitle>
    <form class="flex-1 flex flex-col h-0" @submit.prevent="submit">
      <CardBody class="flex-col gap-5">
        <div class="flex flex-wrap">
          <div class="flex-1 [min-width:20rem] ml-md">
            <FormRow label="Type">
              <AppSelect v-model="form.type" name="type">
                <option v-for="itemType in activeTypes" :key="itemType.code" :value="itemType.code">
                  {{ itemType.label }}
                </option>
              </AppSelect>
            </FormRow>
            <FormRow label="ISBN" group>
              <InputWithButton
                v-model="form.isbn"
                name="isbn"
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
              <AppInput v-model="form.author" name="author" type="text" />
            </FormRow>
            <FormRow label="Titre">
              <AppInput v-model="form.title" name="title" type="text" required />
            </FormRow>
            <FormRow label="Maison d'édition">
              <AppInput v-model="form.publisher" name="publisher" type="text" />
            </FormRow>
            <FormRow label="Distributeur">
              <AppInput v-model="form.distributor" name="distributor" type="text" />
            </FormRow>
            <FormRow label="Mots-clés">
              <AppInput v-model="form.keywords" name="keywords" type="text" />
            </FormRow>
          </div>
          <div class="flex-1 [min-width:20rem] ml-md">
            <FormRow label="Date d’achat">
              <AppInput v-model="form.datebought" name="datebought" type="date" />
            </FormRow>
            <FormRow label="Commentaires">
              <AppTextarea v-model="form.comments" name="comments" />
            </FormRow>
            <FormRow label="Prix de vente">
              <AppInput
                v-model="form.price"
                name="price"
                type="number"
                :step="0.01"
                required
                class="font-number"
              />
            </FormRow>
            <FormRow label="Quantité">
              <AppInput
                v-model="form.amount"
                name="amount"
                type="number"
                :min="0"
                class="font-number"
              />
            </FormRow>
            <FormRow label="TVA">
              <AppSelect v-model="form.tva" name="tva" class="font-number">
                <option v-for="value in TVAValues" :key="value" :value="value">
                  {{ formatTVA(value) }}
                </option>
              </AppSelect>
            </FormRow>
          </div>
        </div>
      </CardBody>
      <CardFooter>
        <div class="flex justify-end">
          <slot />
        </div>
        <AppAlert v-if="alert" :type="alert.type" class="mt-sm" @dismiss="alert = null">
          {{ alert.message }}
        </AppAlert>
      </CardFooter>
    </form>
  </AppCard>
</template>
