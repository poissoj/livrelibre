<script setup lang="ts">
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import Button from "@/components/Button.vue";
import Card from "@/components/Card.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import ItemForm from "@/components/ItemForm.vue";
import LinkButton from "@/components/LinkButton.vue";
import NoResults from "@/components/NoResults.vue";
import Skeleton from "@/components/Skeleton.vue";
import Title from "@/components/Title.vue";
import type { FormFields } from "@/components/itemForm";
import { useTRPCMutation, useTRPCQuery } from "@/utils/query";

const CARD_TITLE = "Modifier un article";

const route = useRoute();
const router = useRouter();
const id = computed(() => Number(route.params.itemId));

const result = useTRPCQuery("searchItem", id);
const mutation = useTRPCMutation("updateItem", { meta: { errorToast: false } });

const submit = async (data: FormFields) => {
  const datebought = data.datebought.split("-").reverse().join("/");
  const item = { ...data, amount: Number(data.amount), datebought };
  const result = await mutation.mutateAsync({ item, id: id.value });
  if (result.type === "success") {
    void router.push(`/item/${String(id.value)}?status=updated`);
  }
  return result;
};

const formData = computed<FormFields | undefined>(() => {
  const data = result.data.value;
  if (!data) return undefined;
  return {
    ...data,
    amount: String(data.amount),
    datebought: data.datebought.split("/").reverse().join("-"),
  };
});
</script>

<template>
  <div class="flex-1">
    <Title>Modifier un article</Title>
    <Card v-if="result.isError.value">
      <CardTitle>{{ CARD_TITLE }}</CardTitle>
      <CardBody>
        <ErrorMessage />
      </CardBody>
    </Card>
    <Card v-else-if="result.isPending.value">
      <CardTitle>{{ CARD_TITLE }}</CardTitle>
      <CardBody>
        <Skeleton :height="410">
          <template v-for="n in 7" :key="n">
            <rect
              x="5%"
              :y="(n - 1) * 50"
              rx="2"
              ry="2"
              width="12%"
              height="30"
            />
            <rect
              x="20%"
              :y="(n - 1) * 50"
              rx="2"
              ry="2"
              width="30%"
              height="30"
            />
            <rect
              x="53%"
              :y="(n - 1) * 50"
              rx="2"
              ry="2"
              width="12%"
              height="30"
            />
            <rect
              x="68%"
              :y="(n - 1) * 50"
              rx="2"
              ry="2"
              width="30%"
              height="30"
            />
          </template>
        </Skeleton>
      </CardBody>
    </Card>
    <Card v-else-if="result.data.value == null">
      <CardTitle>Article introuvable</CardTitle>
      <CardBody>
        <NoResults />
      </CardBody>
    </Card>
    <ItemForm v-else :title="CARD_TITLE" :data="formData" :on-submit="submit">
      <LinkButton :to="`/item/${String(id)}`" class="mr-2 px-md !bg-[#6E6E6E]">
        <FontAwesomeIcon :icon="faTimesCircle" class="mr-sm" />
        Annuler
      </LinkButton>
      <Button type="submit" class="px-md">
        <FontAwesomeIcon :icon="faCheckCircle" class="mr-sm" />
        Modifier
      </Button>
    </ItemForm>
  </div>
</template>
