<script setup lang="ts">
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { ref } from "vue";
import { useRouter } from "vue-router";

import { formatTVA } from "@livrelibre/shared/format";
import { ITEM_TYPES, TVAValues } from "@livrelibre/shared/item";

import AppButton from "@/components/AppButton.vue";
import AppCard from "@/components/AppCard.vue";
import AppInput from "@/components/AppInput.vue";
import AppSelect from "@/components/AppSelect.vue";
import AppTextarea from "@/components/AppTextarea.vue";
import CardBody from "@/components/CardBody.vue";
import CardFooter from "@/components/CardFooter.vue";
import CardTitle from "@/components/CardTitle.vue";
import FormRow from "@/components/FormRow.vue";

const router = useRouter();

const type = ref("");
const isbn = ref("");
const author = ref("");
const title = ref("");
const publisher = ref("");
const distributor = ref("");
const keywords = ref("");
const datebought = ref("");
const comments = ref("");
const price = ref("");
const amount = ref("");
const tva = ref("");

const onSubmit = async () => {
  const query = {
    type: type.value,
    isbn: isbn.value,
    author: author.value,
    title: title.value,
    publisher: publisher.value,
    distributor: distributor.value,
    keywords: keywords.value,
    datebought: datebought.value
      ? datebought.value.split("-").reverse().join("/")
      : "",
    comments: comments.value,
    price: price.value,
    amount: amount.value,
    tva: tva.value,
  };
  await router.push(`/advancedSearch?${new URLSearchParams(query).toString()}`);
};
</script>

<template>
  <div class="[margin-left:10%] [margin-right:10%] flex-1">
    <AppCard class="mb-lg">
      <CardTitle :level="1">Chercher un article</CardTitle>
      <form class="flex-1" @submit.prevent="onSubmit">
        <CardBody class="flex-col">
          <div class="flex flex-wrap">
            <div class="flex-1 [min-width:20rem] ml-md">
              <FormRow label="Type">
                <AppSelect v-model="type">
                  <option value="">--ignorer--</option>
                  <option
                    v-for="[key, label] in Object.entries(ITEM_TYPES)"
                    :key="key"
                    :value="key"
                  >
                    {{ label }}
                  </option>
                </AppSelect>
              </FormRow>
              <FormRow label="ISBN">
                <AppInput v-model="isbn" type="text" :maxlength="13" />
              </FormRow>
              <FormRow label="Auteur·ice">
                <AppInput v-model="author" type="text" />
              </FormRow>
              <FormRow label="Titre">
                <AppInput v-model="title" type="text" />
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
                  :min="0"
                  :step="0.01"
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
                  <option value="">--ignorer--</option>
                  <option
                    v-for="value in TVAValues"
                    :key="value"
                    :value="value"
                  >
                    {{ formatTVA(value) }}
                  </option>
                </AppSelect>
              </FormRow>
            </div>
          </div>
          <CardFooter class="flex justify-end">
            <AppButton type="submit" class="px-md">
              <FontAwesomeIcon :icon="faSearch" class="mr-sm" />
              Rechercher
            </AppButton>
          </CardFooter>
        </CardBody>
      </form>
    </AppCard>
  </div>
</template>
