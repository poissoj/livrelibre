<script setup lang="ts">
import { ref } from "vue";

import { formatPrice } from "@livrelibre/shared/format";

import AppAlert from "@/components/AppAlert.vue";
import AppCard from "@/components/AppCard.vue";
import AppSkeleton from "@/components/AppSkeleton.vue";
import CardBody from "@/components/CardBody.vue";
import CardFooter from "@/components/CardFooter.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import AsideButton from "@/components/cart/AsideButton.vue";
import AsideCartLoader from "@/components/cart/AsideCartLoader.vue";
import CartTable from "@/components/cart/CartTable.vue";
import CustomerSelector from "@/components/cart/CustomerSelector.vue";
import ErrorList from "@/components/cart/ErrorList.vue";
import PaymentForm from "@/components/cart/PaymentForm.vue";
import QuickAdd from "@/components/cart/QuickAdd.vue";
import type { ISBNError } from "@/components/cart/types";
import { useTRPCQuery } from "@/utils/query";

const { data: cart, isPending, isError } = useTRPCQuery("cart", undefined);
const change = ref<number | null>(null);
const errors = ref<ISBNError[]>([]);

const addError = (error: ISBNError) => {
  errors.value = errors.value
    .filter((old) => old.isbn !== error.isbn)
    .concat(error);
};
const removeError = (isbn: string) => {
  errors.value = errors.value.filter((old) => old.isbn !== isbn);
};
</script>

<template>
  <div class="[margin-left:10%] [margin-right:10%] flex-1 flex flex-col gap-6">
    <AppCard v-if="isError">
      <CardTitle>Panier</CardTitle>
      <CardBody>
        <ErrorMessage />
      </CardBody>
    </AppCard>
    <AppCard v-else-if="isPending">
      <CardTitle>Panier</CardTitle>
      <CardBody>
        <AppSkeleton :height="150">
          <template v-for="n in 5" :key="n">
            <rect
              x="2%"
              :y="(n - 1) * 30"
              rx="2"
              ry="2"
              width="25%"
              height="10"
            />
            <rect
              x="32%"
              :y="(n - 1) * 30"
              rx="2"
              ry="2"
              width="25%"
              height="10"
            />
            <rect
              x="62%"
              :y="(n - 1) * 30"
              rx="2"
              ry="2"
              width="25%"
              height="10"
            />
            <rect
              x="92%"
              :y="(n - 1) * 30"
              rx="2"
              ry="2"
              width="6%"
              height="10"
            />
          </template>
        </AppSkeleton>
      </CardBody>
    </AppCard>
    <template v-else-if="(cart?.count ?? 0) === 0">
      <AppCard>
        <div class="flex items-center">
          <CardTitle class="mr-auto">Panier</CardTitle>
          <QuickAdd @error="addError" />
        </div>
        <CardBody class="flex-col">
          <ErrorList :errors="errors" @remove="removeError" />
          <AppAlert
            v-if="change"
            type="info"
            class="mb-5"
            @dismiss="change = null"
          >
            <span>
              À rendre:
              <span class="font-number">{{ change?.toFixed(2) }}</span
              >€
            </span>
          </AppAlert>
          <p>Aucun article dans le panier</p>
        </CardBody>
      </AppCard>
      <AsideCartLoader />
    </template>
    <template v-else>
      <AppCard class="max-h-full flex flex-col">
        <div class="flex items-center">
          <CardTitle class="mr-auto">
            Panier - {{ cart?.count }} article{{
              (cart?.count ?? 0) > 1 ? "s" : ""
            }}
          </CardTitle>
          <QuickAdd @error="addError" />
        </div>
        <CustomerSelector />
        <CardBody class="flex-col">
          <ErrorList :errors="errors" @remove="removeError" />
          <CartTable :items="cart?.items ?? []" />
        </CardBody>
        <CardFooter>
          <p class="mb-2">
            <span class="font-medium [font-size:1.1rem]">
              Total :
              <span class="font-number">
                {{ formatPrice(cart?.total ?? 0) }}
              </span>
            </span>
          </p>
          <div class="flex justify-between">
            <AsideButton />
            <PaymentForm @change="(value) => (change = value)" />
          </div>
        </CardFooter>
      </AppCard>
      <AsideCartLoader />
    </template>
  </div>
</template>
