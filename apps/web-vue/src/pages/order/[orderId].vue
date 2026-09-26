<script setup lang="ts">
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";

import type { RawOrder } from "@livrelibre/shared/order";

import Button from "@/components/Button.vue";
import Card from "@/components/Card.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import ConfirmationDialog from "@/components/ConfirmationDialog.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import LinkButton from "@/components/LinkButton.vue";
import NoResults from "@/components/NoResults.vue";
import OrderForm from "@/components/OrderForm.vue";
import Skeleton from "@/components/Skeleton.vue";
import Title from "@/components/Title.vue";
import type { OrderFormData } from "@/components/orderForm";
import { getErrorMessage } from "@/utils/errors";
import { useTRPCMutation, useTRPCQuery, useTRPCUtils } from "@/utils/query";
import { useQueryParams } from "@/utils/useQueryParams";

const CARD_TITLE = "Modifier une commande";

const route = useRoute();
const router = useRouter();
const utils = useTRPCUtils();
const { query } = useQueryParams();
const id = computed(() => Number(route.params.orderId));

const { data: order, isPending, isError } = useTRPCQuery("order", id);

const { mutateAsync: updateOrder, isPending: updatePending } = useTRPCMutation(
  "updateOrder",
  {
    meta: { errorToast: false },
    onSuccess(result) {
      if (result.type === "success") {
        void utils.invalidate("order", id.value);
        toast.success(result.msg);
        void router.push({ path: "/orders", query: query.value });
      } else {
        toast.error(result.msg);
      }
    },
    onError(error) {
      toast.error(getErrorMessage(error));
    },
  },
);

const deleteMutation = useTRPCMutation("deleteOrder", {
  meta: { errorToast: false },
});

const submit = async (orderInput: RawOrder) =>
  await updateOrder({ order: orderInput, id: id.value });

const deleteOrder = async () => {
  try {
    const res = await deleteMutation.mutateAsync({ id: id.value });
    if (res.type === "success") {
      toast.success(res.msg);
      await router.push({ path: "/orders", query: query.value });
    } else {
      toast.error(res.msg);
    }
  } catch (error) {
    toast.error(getErrorMessage(error));
  }
};

const data = computed<OrderFormData | undefined>(() => {
  const loaded = order.value;
  if (!loaded) return undefined;
  return { ...loaded, created: new Date(loaded.created) };
});
</script>

<template>
  <div class="flex-1 max-w-6xl mx-auto">
    <Title>Modifier une commande</Title>
    <Card v-if="isError">
      <CardTitle>{{ CARD_TITLE }}</CardTitle>
      <CardBody>
        <ErrorMessage />
      </CardBody>
    </Card>
    <Card v-else-if="isPending">
      <CardTitle>{{ CARD_TITLE }}</CardTitle>
      <CardBody>
        <Skeleton :height="300">
          <template v-for="n in 4" :key="n">
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
          </template>
        </Skeleton>
      </CardBody>
    </Card>
    <Card v-else-if="order == null">
      <CardTitle>Commande introuvable</CardTitle>
      <CardBody>
        <NoResults />
      </CardBody>
    </Card>
    <OrderForm
      v-else-if="data"
      :title="CARD_TITLE"
      :data="data"
      @submit="submit"
    >
      <ConfirmationDialog
        title="Supprimer une commande"
        message="Êtes-vous sûr⋅e de vouloir supprimer cette commande ? Cette action ne peut pas être annulée."
        @confirm="deleteOrder"
      />
      <LinkButton
        :to="{ path: '/orders', query: query }"
        class="mr-2 px-md !bg-gray-medium"
      >
        <FontAwesomeIcon :icon="faTimesCircle" class="mr-sm" />
        Annuler
      </LinkButton>
      <Button type="submit" class="px-md" :disabled="updatePending">
        <FontAwesomeIcon :icon="faCheckCircle" class="mr-sm" />
        Modifier
      </Button>
    </OrderForm>
  </div>
</template>
