<script setup lang="ts">
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { keepPreviousData } from "@tanstack/vue-query";
import { computed, ref } from "vue";
import { ContentLoader } from "vue-content-loader";
import { useRoute } from "vue-router";

import Card from "@/components/Card.vue";
import CardBody from "@/components/CardBody.vue";
import CardFooter from "@/components/CardFooter.vue";
import CardTitle from "@/components/CardTitle.vue";
import CustomersTable from "@/components/CustomersTable.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import Input from "@/components/Input.vue";
import ItemsCard from "@/components/ItemsCard.vue";
import LinkButton from "@/components/LinkButton.vue";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import Pagination from "@/components/Pagination.vue";
import Title from "@/components/Title.vue";
import { useTRPCQuery } from "@/utils/query";
import { useDebouncedValue } from "@/utils/useDebouncedValue";
import { useDelayedLoading } from "@/utils/useDelayedLoading";

const route = useRoute();
const page = computed(() => {
  const queryPage = route.query.page;
  return typeof queryPage === "string" ? Number(queryPage) : 1;
});

const search = ref("");
const withPurchases = ref(false);
const debouncedSearch = useDebouncedValue(search, 300);

const query = computed(() => ({
  pageNumber: page.value,
  fullname: debouncedSearch.value,
  withPurchases: withPurchases.value,
}));

const result = useTRPCQuery("customers", query, {
  placeholderData: keepPreviousData,
});
const showLoading = useDelayedLoading(
  computed(() => result.isFetching.value),
  500,
);

const pageCount = computed(() => result.data.value?.pageCount ?? 0);
const listTitle = computed(() => {
  let title = `${String(result.data.value?.count ?? 0)} client⋅es `;
  if (pageCount.value > 1) {
    title += ` - Page ${String(page.value)} sur ${String(pageCount.value)}`;
  }
  return title;
});
const pageTitle = computed(() => {
  let title = "Liste des client⋅es";
  if (pageCount.value > 1) {
    title += ` | Page ${String(page.value)} sur ${String(pageCount.value)}`;
  }
  return title;
});
</script>

<template>
  <div class="flex flex-1 flex-col gap-lg">
    <Title>Liste des client⋅es</Title>
    <ItemsCard v-if="result.isError.value" title="Liste des client⋅es">
      <ErrorMessage />
    </ItemsCard>
    <ItemsCard v-else-if="result.isPending.value" title="Liste des client⋅es">
      <ContentLoader :height="300" width="100%">
        <template v-for="n in 10" :key="n">
          <rect
            x="2%"
            :y="(n - 1) * 30 + 15"
            rx="2"
            ry="2"
            width="25%"
            height="10"
          />
          <rect
            x="32%"
            :y="(n - 1) * 30 + 15"
            rx="2"
            ry="2"
            width="25%"
            height="10"
          />
          <rect
            x="62%"
            :y="(n - 1) * 30 + 15"
            rx="2"
            ry="2"
            width="25%"
            height="10"
          />
          <rect
            x="92%"
            :y="(n - 1) * 30 + 15"
            rx="2"
            ry="2"
            width="6%"
            height="10"
          />
        </template>
      </ContentLoader>
    </ItemsCard>
    <Card v-else class="max-h-full overflow-hidden flex flex-col relative">
      <Title>{{ pageTitle }}</Title>
      <CardTitle class="flex items-center">
        {{ listTitle }}
        <Input
          v-model="search"
          class="mx-auto !w-[13rem] text-base"
          placeholder="Nom, prénom"
        />
        <label class="text-base cursor-pointer">
          <span>Avec achats</span>
          <input v-model="withPurchases" type="checkbox" class="ml-2" />
        </label>
        <LinkButton to="/customer/new" class="ml-auto">
          <FontAwesomeIcon :icon="faUserPlus" class="mr-2" />
          Nouveau client
        </LinkButton>
      </CardTitle>
      <CardBody>
        <LoadingOverlay v-if="showLoading">
          <CustomersTable :items="result.data.value?.items ?? []" />
        </LoadingOverlay>
        <CustomersTable v-else :items="result.data.value?.items ?? []" />
      </CardBody>
      <CardFooter
        v-if="pageCount > 1"
        class="flex justify-center pt-6 2xl:pt-8"
      >
        <Pagination :count="pageCount" />
      </CardFooter>
    </Card>
  </div>
</template>
