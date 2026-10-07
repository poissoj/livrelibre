<script setup lang="ts">
import { faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import AppButton from "@/components/AppButton.vue";
import AppCard from "@/components/AppCard.vue";
import AppSkeleton from "@/components/AppSkeleton.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import type { FormFields } from "@/components/itemForm";
import ItemForm from "@/components/ItemForm.vue";
import LinkButton from "@/components/LinkButton.vue";
import NoResults from "@/components/NoResults.vue";
import { useTRPCMutation, useTRPCQuery, useTRPCUtils } from "@/utils/query";

const CARD_TITLE = "Modifier un article";

const route = useRoute();
const router = useRouter();
const utils = useTRPCUtils();
const id = computed(() => Number(route.params.itemId));

const { data: item, isPending, isError, refetch } = useTRPCQuery("searchItem", id);
const { mutateAsync: updateItem } = useTRPCMutation("updateItem", {
  meta: { errorToast: false },
});

const submit = async (data: FormFields) => {
  const payload = { ...data, amount: Number(data.amount) };
  const result = await updateItem({ item: payload, id: id.value });
  if (result.type === "success") {
    await utils.invalidate("searchItem", id.value);
    void utils.invalidate("items");
    void utils.invalidate("advancedSearch");
    void router.push(`/item/${String(id.value)}?status=updated`);
  }
  return result;
};

const formData = computed<FormFields | undefined>(() => {
  const loaded = item.value;
  if (!loaded) return undefined;
  return {
    ...loaded,
    amount: String(loaded.amount),
  };
});
</script>

<template>
  <div class="flex-1">
    <AppCard v-if="isError">
      <CardTitle :level="1">{{ CARD_TITLE }}</CardTitle>
      <CardBody>
        <ErrorMessage :on-retry="refetch" />
      </CardBody>
    </AppCard>
    <AppCard v-else-if="isPending">
      <CardTitle :level="1">{{ CARD_TITLE }}</CardTitle>
      <CardBody>
        <AppSkeleton :height="410">
          <template v-for="n in 7" :key="n">
            <rect x="5%" :y="(n - 1) * 50" rx="2" ry="2" width="12%" height="30" />
            <rect x="20%" :y="(n - 1) * 50" rx="2" ry="2" width="30%" height="30" />
            <rect x="53%" :y="(n - 1) * 50" rx="2" ry="2" width="12%" height="30" />
            <rect x="68%" :y="(n - 1) * 50" rx="2" ry="2" width="30%" height="30" />
          </template>
        </AppSkeleton>
      </CardBody>
    </AppCard>
    <AppCard v-else-if="item == null">
      <CardTitle :level="1">Article introuvable</CardTitle>
      <CardBody>
        <NoResults />
      </CardBody>
    </AppCard>
    <ItemForm v-else :title="CARD_TITLE" :data="formData" :on-submit="submit">
      <LinkButton :to="`/item/${String(id)}`" class="mr-2 px-md !bg-gray-medium">
        <FontAwesomeIcon :icon="faTimesCircle" class="mr-sm" />
        Retour
      </LinkButton>
      <AppButton type="submit" class="px-md">
        <FontAwesomeIcon :icon="faCheckCircle" class="mr-sm" />
        Modifier
      </AppButton>
    </ItemForm>
  </div>
</template>
