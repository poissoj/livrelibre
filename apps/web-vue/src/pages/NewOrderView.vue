<script setup lang="ts">
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";

import type { RawOrder } from "@livrelibre/shared/order";

import AppButton from "@/components/AppButton.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import OrderForm from "@/components/OrderForm.vue";
import type { OrderFormData } from "@/components/orderForm";
import { getErrorMessage } from "@/utils/errors";
import { useTRPCMutation, useTRPCQuery } from "@/utils/query";

const route = useRoute();
const router = useRouter();

const rawId = route.query.item;
const itemIdStr = typeof rawId === "string" ? rawId : "";

const {
  data: itemData,
  isPending: itemPending,
  isError: itemError,
} = useTRPCQuery(
  "searchItem",
  computed(() => Number(itemIdStr)),
  computed(() => ({ enabled: itemIdStr !== "" })),
);

const { mutateAsync: createOrder, isPending: createPending } = useTRPCMutation(
  "newOrder",
  {
    meta: { errorToast: false },
    onSuccess(result) {
      if (result.type === "success") {
        toast.success(result.msg);
        void router.push("/orders");
      } else {
        toast.error(result.msg);
      }
    },
    onError(error) {
      toast.error(getErrorMessage(error));
    },
  },
);

const submit = async (order: RawOrder) => await createOrder(order);

const data = computed<OrderFormData>(() => ({
  item: itemData.value || null,
  nb: 1,
  created: new Date(),
}));
</script>

<template>
  <div class="flex-1 max-w-6xl mx-auto">
    <ErrorMessage v-if="itemError" />
    <div v-else-if="itemPending && itemIdStr">Chargement…</div>
    <OrderForm v-else title="Nouvelle commande" :data="data" @submit="submit">
      <AppButton type="submit" class="px-md" :disabled="createPending">
        <FontAwesomeIcon :icon="faPlus" class="mr-sm" />
        Ajouter
      </AppButton>
    </OrderForm>
  </div>
</template>
