<script setup lang="ts">
import { keepPreviousData } from "@tanstack/vue-query";
import { computed } from "vue";
import { useRoute } from "vue-router";

import { ITEMS_PER_PAGE } from "@livrelibre/shared/pagination";

import Card from "@/components/Card.vue";
import CardBody from "@/components/CardBody.vue";
import CardFooter from "@/components/CardFooter.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import ItemsCard from "@/components/ItemsCard.vue";
import ItemsTable from "@/components/ItemsTable.vue";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import Pagination from "@/components/Pagination.vue";
import Skeleton from "@/components/Skeleton.vue";
import Title from "@/components/Title.vue";
import { useTRPCQuery } from "@/utils/query";
import { useDelayedLoading } from "@/utils/useDelayedLoading";

const route = useRoute();
const page = computed(() => {
  const queryPage = route.query.page;
  return typeof queryPage === "string" ? Number(queryPage) : 1;
});

const {
  data: pageData,
  isPending,
  isError,
  isFetching,
} = useTRPCQuery("items", page, {
  placeholderData: keepPreviousData,
});
const showLoading = useDelayedLoading(isFetching, 500);

const pageCount = computed(() =>
  pageData.value ? Math.ceil(pageData.value.count / ITEMS_PER_PAGE) : 0,
);
const listTitle = computed(() => {
  let title = "Tous les articles";
  if (pageCount.value > 1) {
    title += ` - Page ${String(page.value)} sur ${String(pageCount.value)}`;
  }
  return title;
});
const pageTitle = computed(() => {
  let title = "Liste des articles";
  if (pageCount.value > 1) {
    title += ` | Page ${String(page.value)} sur ${String(pageCount.value)}`;
  }
  return title;
});
</script>

<template>
  <div class="flex flex-1 flex-col gap-lg">
    <Title>Liste des articles</Title>
    <ItemsCard v-if="isError" title="Liste des articles">
      <ErrorMessage />
    </ItemsCard>
    <ItemsCard v-else-if="isPending" title="Liste des articles">
      <Skeleton :height="300">
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
      </Skeleton>
    </ItemsCard>
    <Card v-else class="max-h-full overflow-hidden flex flex-col relative">
      <Title>{{ pageTitle }}</Title>
      <CardTitle>{{ listTitle }}</CardTitle>
      <p class="mt-sm">{{ pageData?.count ?? 0 }} articles</p>
      <CardBody>
        <LoadingOverlay v-if="showLoading">
          <ItemsTable :items="pageData?.items ?? []" />
        </LoadingOverlay>
        <ItemsTable v-else :items="pageData?.items ?? []" />
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
