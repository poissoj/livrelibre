<script setup lang="ts">
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";

import { formatPrice } from "@livrelibre/shared/format";

import Button from "@/components/Button.vue";
import Card from "@/components/Card.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import ConfirmationDialog from "@/components/ConfirmationDialog.vue";
import CustomerForm from "@/components/CustomerForm.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import LinkButton from "@/components/LinkButton.vue";
import NoResults from "@/components/NoResults.vue";
import Skeleton from "@/components/Skeleton.vue";
import StatusCircle from "@/components/StatusCircle.vue";
import type { CustomerFormFields } from "@/components/customerForm";
import { getErrorMessage } from "@/utils/errors";
import { useTRPCMutation, useTRPCQuery, useTRPCUtils } from "@/utils/query";

const CARD_TITLE = "Modifier un⋅e client⋅e";

const route = useRoute();
const router = useRouter();
const utils = useTRPCUtils();
const id = computed(() => Number(route.params.customerId));

const { data: customer, isPending, isError } = useTRPCQuery("customer", id);
const { data: customerOrders } = useTRPCQuery("customerOrders", id);
const { mutateAsync: saveCustomer, isPending: savePending } = useTRPCMutation(
  "updateCustomer",
  {
    meta: { errorToast: false },
    onSuccess() {
      void utils.invalidate("customer");
    },
  },
);
const deleteMutation = useTRPCMutation("deleteCustomer", {
  meta: { errorToast: false },
});

const submit = async (customer: CustomerFormFields) =>
  await saveCustomer({ customer, customerId: id.value });

const deleteCustomer = async () => {
  try {
    const res = await deleteMutation.mutateAsync({ id: id.value });
    if (res.type === "success") {
      toast.success(res.msg);
      await router.push("/customers");
    } else {
      toast.error(res.msg);
    }
  } catch (error) {
    toast.error(getErrorMessage(error));
  }
};

const total = computed(
  () => customer.value?.purchases.reduce((sum, p) => sum + p.amount, 0) ?? 0,
);
</script>

<template>
  <div class="flex-1">
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
    <Card v-else-if="customer == null">
      <CardTitle>Client introuvable</CardTitle>
      <CardBody>
        <NoResults />
      </CardBody>
    </Card>
    <div v-else class="flex flex-col gap-4 mb-lg">
      <CustomerForm :title="CARD_TITLE" :data="customer" :on-submit="submit">
        <ConfirmationDialog
          title="Supprimer un⋅e client⋅e"
          message="Êtes-vous sûr⋅e de vouloir supprimer ce⋅tte client⋅e ? Cette action ne peut pas être annulée."
          @confirm="deleteCustomer"
        />
        <LinkButton to="/customers" class="mr-2 px-md !bg-gray-medium">
          <FontAwesomeIcon :icon="faTimesCircle" class="mr-sm" />
          Annuler
        </LinkButton>
        <Button type="submit" class="px-md" :disabled="savePending">
          <FontAwesomeIcon :icon="faCheckCircle" class="mr-sm" />
          Modifier
        </Button>
      </CustomerForm>
      <div class="grow flex gap-4">
        <Card class="flex-1">
          <CardTitle>Détail des achats</CardTitle>
          <CardBody class="flex-col">
            <template v-if="customer.purchases.length > 0">
              <div class="mb-2">
                {{ customer.purchases.length }} achat{{
                  customer.purchases.length > 1 ? "s" : ""
                }}
                pour un total de {{ formatPrice(total) }}
              </div>
              <table
                class="w-fit border-separate border-spacing-x-4 border-spacing-y-1"
              >
                <thead>
                  <tr>
                    <th class="text-left">Date</th>
                    <th class="text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(purchase, i) in customer.purchases" :key="i">
                    <td>{{ purchase.date }}</td>
                    <td class="text-right font-number">
                      {{ formatPrice(purchase.amount) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </template>
            <span v-else>Aucun achat pour ce⋅tte client⋅e</span>
          </CardBody>
        </Card>
        <Card class="flex-1">
          <CardTitle>
            Commandes en cours: {{ customerOrders?.length ?? 0 }}
          </CardTitle>
          <CardBody>
            <span v-if="!customerOrders || customerOrders.length === 0">
              Aucune commande en cours pour ce⋅tte client⋅e
            </span>
            <ul v-else>
              <li v-for="order in customerOrders" :key="order.id" class="mb-1">
                <RouterLink
                  :to="`/order/${String(order.id)}`"
                  class="flex gap-2 items-center"
                >
                  <StatusCircle :status="order.ordered" />
                  {{ order.itemTitle }}
                </RouterLink>
              </li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  </div>
</template>
