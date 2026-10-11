<script setup lang="ts">
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  ORDER_STATUS,
  type OrderRow,
  type OrderSort,
  type OrderStatus,
  zOrderSort,
  zOrderStatus,
  zOrderStatusArray,
} from "@livrelibre/shared/order";
import { keepPreviousData, useQuery } from "@tanstack/vue-query";
import { computed, ref, watch } from "vue";

import AppCard from "@/components/AppCard.vue";
import AppInput from "@/components/AppInput.vue";
import AppPagination from "@/components/AppPagination.vue";
import CardBody from "@/components/CardBody.vue";
import CardFooter from "@/components/CardFooter.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import ItemsCard from "@/components/ItemsCard.vue";
import LinkButton from "@/components/LinkButton.vue";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import { groupOrdersByCustomer } from "@/components/orders/group";
import StatusTile from "@/components/orders/StatusTile.vue";
import OrdersTable from "@/components/OrdersTable.vue";
import OrdersTableByCustomer from "@/components/OrdersTableByCustomer.vue";
import { trpcClient } from "@/utils/trpc";
import { useDebouncedValue } from "@/utils/useDebouncedValue";
import { useDelayedLoading } from "@/utils/useDelayedLoading";
import { usePageParam, useQueryParams } from "@/utils/useQueryParams";

const getStatus = (query: string | string[] | undefined): OrderStatus[] => {
  const statusList = zOrderStatusArray.safeParse(query);
  if (statusList.success) {
    return statusList.data;
  }
  const status = zOrderStatus.safeParse(query);
  if (status.success) {
    return [status.data];
  }
  return ["new", "received", "unavailable", "other", "canceled"];
};

const { query, push } = useQueryParams();
const page = usePageParam();

const orderStatus = computed(() => getStatus(query.value.status));
const search = computed(() => (typeof query.value.search === "string" ? query.value.search : ""));
const sortBy = computed<OrderSort>(() => {
  const parsed = zOrderSort.safeParse(query.value.sortBy);
  return parsed.success ? parsed.data : "dateDesc";
});
const groupByCustomer = computed(() => query.value.group !== "0");

const ordersInput = computed(() => ({
  statuses: orderStatus.value,
  page: page.value,
  grouped: groupByCustomer.value,
  search: search.value,
  sortBy: sortBy.value,
}));

const {
  data: ordersData,
  isPending,
  isError,
  isFetching,
  refetch,
} = useQuery({
  queryKey: ["orders", ordersInput],
  queryFn: () => trpcClient.orders.query(ordersInput.value),
  placeholderData: keepPreviousData,
  staleTime: 30_000,
});
const showLoading = useDelayedLoading(isFetching, 500);

const orderRows = computed<OrderRow[]>(() =>
  (ordersData.value?.items ?? []).map((order) => ({
    ...order,
    created: new Date(order.created),
  })),
);

const pageCount = computed(() => ordersData.value?.pageCount ?? 0);
const ordersCount = computed(() => ordersData.value?.count ?? 0);

const withoutPage = () => {
  const { page: _page, ...rest } = query.value;
  return rest;
};

const setOrderStatus = (status: OrderStatus[]) => {
  void push({ query: { ...withoutPage(), status } });
};
const updateStatus = (status: OrderStatus) => () => {
  const newStatus = orderStatus.value.includes(status)
    ? orderStatus.value.filter((s) => s !== status)
    : orderStatus.value.concat(status);
  setOrderStatus(newStatus);
};

const searchInput = ref(search.value);
const debouncedSearch = useDebouncedValue(searchInput, 300);

watch(debouncedSearch, (value) => {
  const normalized = value.toLowerCase();
  if (normalized === search.value) return;
  void push({ query: { ...withoutPage(), search: normalized }, replace: true });
});
watch(search, (value) => {
  if (value !== searchInput.value.toLowerCase()) {
    searchInput.value = value;
  }
});

const toggleGroup = () => {
  const group = 1 - Number(groupByCustomer.value);
  void push({ query: { ...withoutPage(), group } });
};
const invertInnerSort = computed(() => query.value.sortBy === "date");

const cardTitle = computed(() => {
  if (isPending.value) {
    return "Chargement";
  }
  let title = `${String(ordersCount.value)} commande${ordersCount.value > 1 ? "s" : ""}`;
  if (pageCount.value > 1) {
    title += ` - Page ${String(page.value)} sur ${String(pageCount.value)}`;
  }
  return title;
});

const groupedOrders = computed(() => groupOrdersByCustomer(orderRows.value, invertInnerSort.value));
</script>

<template>
  <div class="flex flex-1 flex-col gap-lg">
    <ItemsCard v-if="isError" title="Liste des commandes">
      <ErrorMessage :on-retry="refetch" />
    </ItemsCard>
    <AppCard v-else class="max-h-full overflow-hidden flex flex-col relative">
      <CardTitle :level="1" class="flex items-center">
        {{ cardTitle }}
        <LinkButton to="/order/new" class="ml-auto">
          <FontAwesomeIcon :icon="faPlus" class="mr-2" />
          Nouvelle commande
        </LinkButton>
      </CardTitle>
      <CardBody class="flex-col">
        <div class="flex gap-2 items-center flex-wrap">
          <div class="flex flex-col mb-2 mr-auto">
            <AppInput
              v-model="searchInput"
              class="text-base mb-1 !w-[30rem]"
              placeholder="Nom, prénom, titre, ISBN"
            />
            <div>
              <label for="groupByCustomer" class="mr-2 cursor-pointer">
                Grouper les commandes par client⋅e
              </label>
              <input
                id="groupByCustomer"
                type="checkbox"
                :checked="groupByCustomer"
                @change="toggleGroup"
              />
            </div>
          </div>
          <div class="flex gap-2 mr-1">
            <StatusTile
              v-for="status in ORDER_STATUS"
              :key="status"
              :status="status"
              :checked="orderStatus.includes(status)"
              @toggle="updateStatus(status)()"
            />
          </div>
        </div>
        <LoadingOverlay :loading="showLoading">
          <div class="overflow-auto flex flex-1 mt-2">
            <OrdersTableByCustomer v-if="groupByCustomer" :items="groupedOrders" />
            <OrdersTable v-else :items="orderRows" />
          </div>
        </LoadingOverlay>
      </CardBody>
      <CardFooter v-if="pageCount > 1" class="flex justify-center pt-6 2xl:pt-8">
        <AppPagination :count="pageCount" />
      </CardFooter>
    </AppCard>
  </div>
</template>
