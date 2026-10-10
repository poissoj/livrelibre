<script setup lang="ts">
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  ORDER_STATUS,
  type OrderRow,
  type OrderStatus,
  zOrderStatus,
  zOrderStatusArray,
} from "@livrelibre/shared/order";
import { useQuery } from "@tanstack/vue-query";
import { computed, ref, watch } from "vue";

import AppCard from "@/components/AppCard.vue";
import AppInput from "@/components/AppInput.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import ItemsCard from "@/components/ItemsCard.vue";
import LinkButton from "@/components/LinkButton.vue";
import { filterGroups, filterOrders, groupOrdersByCustomer } from "@/components/orders/group";
import StatusTile from "@/components/orders/StatusTile.vue";
import OrdersTable from "@/components/OrdersTable.vue";
import OrdersTableByCustomer from "@/components/OrdersTableByCustomer.vue";
import { trpcClient } from "@/utils/trpc";
import { useDebouncedValue } from "@/utils/useDebouncedValue";
import { useQueryParams } from "@/utils/useQueryParams";

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

const orderStatus = computed(() => getStatus(query.value.status));
const {
  data: ordersData,
  isPending,
  isError,
  refetch,
} = useQuery({
  queryKey: ["orders", orderStatus],
  queryFn: () => trpcClient.orders.query(orderStatus.value),
});
const orderRows = computed<OrderRow[]>(() =>
  (ordersData.value ?? []).map((order) => ({
    ...order,
    created: new Date(order.created),
  })),
);

const setOrderStatus = (status: OrderStatus[]) => {
  void push({ query: { ...query.value, status } });
};
const updateStatus = (status: OrderStatus) => () => {
  const newStatus = orderStatus.value.includes(status)
    ? orderStatus.value.filter((s) => s !== status)
    : orderStatus.value.concat(status);
  setOrderStatus(newStatus);
};

const search = computed(() => (typeof query.value.search === "string" ? query.value.search : ""));
const searchInput = ref(search.value);
const debouncedSearch = useDebouncedValue(searchInput, 300);

watch(debouncedSearch, (value) => {
  const normalized = value.toLowerCase();
  if (normalized === search.value) return;
  void push({ query: { ...query.value, search: normalized }, replace: true });
});
watch(search, (value) => {
  if (value !== searchInput.value.toLowerCase()) {
    searchInput.value = value;
  }
});

const groupByCustomer = computed(() => query.value.group !== "0");
const toggleGroup = () => {
  const group = 1 - Number(groupByCustomer.value);
  void push({ query: { ...query.value, group } });
};
const invertInnerSort = computed(() => query.value.sortBy === "date");

const cardTitle = computed(() =>
  isPending.value
    ? "Chargement"
    : `${String(orderRows.value.length)} commande${orderRows.value.length > 1 ? "s" : ""}`,
);

const groupedOrders = computed(() =>
  filterGroups(groupOrdersByCustomer(orderRows.value, invertInnerSort.value), search.value),
);
const filteredOrders = computed(() => filterOrders(orderRows.value, search.value));
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
        <div class="overflow-auto flex mt-2">
          <OrdersTableByCustomer v-if="groupByCustomer" :items="groupedOrders" />
          <OrdersTable v-else :items="filteredOrders" />
        </div>
      </CardBody>
    </AppCard>
  </div>
</template>
