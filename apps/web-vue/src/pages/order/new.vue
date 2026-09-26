<script setup lang="ts">
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";

import type { RawOrder } from "@livrelibre/shared/order";

import Button from "@/components/Button.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import OrderForm from "@/components/OrderForm.vue";
import Title from "@/components/Title.vue";
import type { OrderFormData } from "@/components/orderForm";
import { getErrorMessage } from "@/utils/errors";
import { useTRPCMutation, useTRPCQuery } from "@/utils/query";

const route = useRoute();
const router = useRouter();

const rawId = route.query.item;
const itemIdStr = typeof rawId === "string" ? rawId : "";

const itemQuery = useTRPCQuery(
  "searchItem",
  computed(() => Number(itemIdStr)),
  computed(() => ({ enabled: itemIdStr !== "" })),
);

const mutation = useTRPCMutation("newOrder", {
  meta: { errorToast: false },
  onSuccess(data) {
    if (data.type === "success") {
      toast.success(data.msg);
      void router.push("/orders");
    } else {
      toast.error(data.msg);
    }
  },
  onError(error) {
    toast.error(getErrorMessage(error));
  },
});

const submit = async (order: RawOrder) => await mutation.mutateAsync(order);

const data = computed<OrderFormData>(() => ({
  item: itemQuery.data.value || null,
  nb: 1,
  created: new Date(),
}));
</script>

<template>
  <div class="flex-1 max-w-6xl mx-auto">
    <Title>Nouvelle commande</Title>
    <ErrorMessage v-if="itemQuery.isError.value" />
    <div v-else-if="itemQuery.isPending.value && itemIdStr">Chargement…</div>
    <OrderForm v-else title="Nouvelle commande" :data="data" @submit="submit">
      <Button type="submit" class="px-md" :disabled="mutation.isPending.value">
        <FontAwesomeIcon :icon="faPlus" class="mr-sm" />
        Ajouter
      </Button>
    </OrderForm>
  </div>
</template>
