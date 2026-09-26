<script setup lang="ts">
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { ref } from "vue";
import { useRouter } from "vue-router";

import { formatTVA } from "@livrelibre/shared/format";
import { ITEM_TYPES, TVAValues } from "@livrelibre/shared/item";

import Button from "@/components/Button.vue";
import Card from "@/components/Card.vue";
import CardBody from "@/components/CardBody.vue";
import CardFooter from "@/components/CardFooter.vue";
import CardTitle from "@/components/CardTitle.vue";
import FormRow from "@/components/FormRow.vue";
import Input from "@/components/Input.vue";
import Select from "@/components/Select.vue";
import Textarea from "@/components/Textarea.vue";

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
    <Card class="mb-lg">
      <CardTitle>Chercher un article</CardTitle>
      <form class="flex-1" @submit.prevent="onSubmit">
        <CardBody class="flex-col">
          <div class="flex flex-wrap">
            <div class="flex-1 [min-width:20rem] ml-md">
              <FormRow label="Type">
                <Select v-model="type">
                  <option value="">--ignorer--</option>
                  <option
                    v-for="[key, label] in Object.entries(ITEM_TYPES)"
                    :key="key"
                    :value="key"
                  >
                    {{ label }}
                  </option>
                </Select>
              </FormRow>
              <FormRow label="ISBN">
                <Input v-model="isbn" type="text" :maxlength="13" />
              </FormRow>
              <FormRow label="Auteur·ice">
                <Input v-model="author" type="text" />
              </FormRow>
              <FormRow label="Titre">
                <Input v-model="title" type="text" />
              </FormRow>
              <FormRow label="Maison d'édition">
                <Input v-model="publisher" type="text" />
              </FormRow>
              <FormRow label="Distributeur">
                <Input v-model="distributor" type="text" />
              </FormRow>
              <FormRow label="Mots-clés">
                <Input v-model="keywords" type="text" />
              </FormRow>
            </div>
            <div class="flex-1 [min-width:20rem] ml-md">
              <FormRow label="Date d’achat">
                <Input v-model="datebought" type="date" />
              </FormRow>
              <FormRow label="Commentaires">
                <Textarea v-model="comments" />
              </FormRow>
              <FormRow label="Prix de vente">
                <Input
                  v-model="price"
                  type="number"
                  :min="0"
                  :step="0.01"
                  class="font-number"
                />
              </FormRow>
              <FormRow label="Quantité">
                <Input
                  v-model="amount"
                  type="number"
                  :min="0"
                  class="font-number"
                />
              </FormRow>
              <FormRow label="TVA">
                <Select v-model="tva" class="font-number">
                  <option value="">--ignorer--</option>
                  <option
                    v-for="value in TVAValues"
                    :key="value"
                    :value="value"
                  >
                    {{ formatTVA(value) }}
                  </option>
                </Select>
              </FormRow>
            </div>
          </div>
          <CardFooter class="flex justify-end">
            <Button type="submit" class="px-md">
              <FontAwesomeIcon :icon="faSearch" class="mr-sm" />
              Rechercher
            </Button>
          </CardFooter>
        </CardBody>
      </form>
    </Card>
  </div>
</template>
