<script setup lang="ts">
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { keepPreviousData } from "@tanstack/vue-query";
import { computed, ref } from "vue";

import AppCard from "@/components/AppCard.vue";
import AppInput from "@/components/AppInput.vue";
import AppPagination from "@/components/AppPagination.vue";
import AppSkeleton from "@/components/AppSkeleton.vue";
import CardBody from "@/components/CardBody.vue";
import CardFooter from "@/components/CardFooter.vue";
import CardTitle from "@/components/CardTitle.vue";
import CustomersTable from "@/components/CustomersTable.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import ItemsCard from "@/components/ItemsCard.vue";
import LinkButton from "@/components/LinkButton.vue";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import { useTitle } from "@/lib/useTitle";
import { useTRPCQuery } from "@/utils/query";
import { useDebouncedValue } from "@/utils/useDebouncedValue";
import { useDelayedLoading } from "@/utils/useDelayedLoading";
import { usePageParam } from "@/utils/useQueryParams";

const page = usePageParam();

const search = ref("");
const withPurchases = ref(false);
const debouncedSearch = useDebouncedValue(search, 300);

const query = computed(() => ({
  pageNumber: page.value,
  fullname: debouncedSearch.value,
  withPurchases: withPurchases.value,
}));

const {
  data: pageData,
  isPending,
  isError,
  isFetching,
  refetch,
} = useTRPCQuery("customers", query, {
  placeholderData: keepPreviousData,
});
const showLoading = useDelayedLoading(isFetching, 500);

const pageCount = computed(() => pageData.value?.pageCount ?? 0);
const listTitle = computed(() => {
  let title = `${String(pageData.value?.count ?? 0)} client⋅es `;
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
useTitle(pageTitle);
</script>

<template>
  <div class="flex flex-1 flex-col gap-lg">
    <ItemsCard v-if="isError" title="Liste des client⋅es">
      <ErrorMessage :on-retry="refetch" />
    </ItemsCard>
    <ItemsCard v-else-if="isPending" title="Liste des client⋅es">
      <AppSkeleton :height="300">
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
      </AppSkeleton>
    </ItemsCard>
    <AppCard v-else class="max-h-full overflow-hidden flex flex-col relative">
      <CardTitle class="flex items-center">
        {{ listTitle }}
        <AppInput
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
        <LoadingOverlay :loading="showLoading">
          <CustomersTable :items="pageData?.items ?? []" />
        </LoadingOverlay>
      </CardBody>
      <CardFooter
        v-if="pageCount > 1"
        class="flex justify-center pt-6 2xl:pt-8"
      >
        <AppPagination :count="pageCount" />
      </CardFooter>
    </AppCard>
  </div>
</template>
