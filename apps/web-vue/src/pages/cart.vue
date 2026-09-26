<script setup lang="ts">
import { ref } from "vue";

import { formatPrice } from "@livrelibre/shared/format";

import Alert from "@/components/Alert.vue";
import Card from "@/components/Card.vue";
import CardBody from "@/components/CardBody.vue";
import CardFooter from "@/components/CardFooter.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import Skeleton from "@/components/Skeleton.vue";
import Title from "@/components/Title.vue";
import AsideButton from "@/components/cart/AsideButton.vue";
import AsideCartLoader from "@/components/cart/AsideCartLoader.vue";
import CartTable from "@/components/cart/CartTable.vue";
import CustomerSelector from "@/components/cart/CustomerSelector.vue";
import ErrorList from "@/components/cart/ErrorList.vue";
import PaymentForm from "@/components/cart/PaymentForm.vue";
import QuickAdd from "@/components/cart/QuickAdd.vue";
import type { ISBNError } from "@/components/cart/types";
import { useTRPCQuery } from "@/utils/query";

const result = useTRPCQuery("cart", undefined);
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
    <Title>Panier</Title>
    <Card v-if="result.isError.value">
      <CardTitle>Panier</CardTitle>
      <CardBody>
        <ErrorMessage />
      </CardBody>
    </Card>
    <Card v-else-if="result.isPending.value">
      <CardTitle>Panier</CardTitle>
      <CardBody>
        <Skeleton :height="150">
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
        </Skeleton>
      </CardBody>
    </Card>
    <template v-else-if="(result.data.value?.count ?? 0) === 0">
      <Card>
        <div class="flex items-center">
          <CardTitle class="mr-auto">Panier</CardTitle>
          <QuickAdd @error="addError" />
        </div>
        <CardBody class="flex-col">
          <ErrorList :errors="errors" @remove="removeError" />
          <Alert
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
          </Alert>
          <p>Aucun article dans le panier</p>
        </CardBody>
      </Card>
      <AsideCartLoader />
    </template>
    <template v-else>
      <Card class="max-h-full flex flex-col">
        <div class="flex items-center">
          <CardTitle class="mr-auto">
            Panier - {{ result.data.value?.count }} article{{
              (result.data.value?.count ?? 0) > 1 ? "s" : ""
            }}
          </CardTitle>
          <QuickAdd @error="addError" />
        </div>
        <CustomerSelector />
        <CardBody class="flex-col">
          <ErrorList :errors="errors" @remove="removeError" />
          <CartTable :items="result.data.value?.items ?? []" />
        </CardBody>
        <CardFooter>
          <p class="mb-2">
            <span class="font-medium [font-size:1.1rem]">
              Total :
              <span class="font-number">
                {{ formatPrice(result.data.value?.total ?? 0) }}
              </span>
            </span>
          </p>
          <div class="flex justify-between">
            <AsideButton />
            <PaymentForm @change="(value) => (change = value)" />
          </div>
        </CardFooter>
      </Card>
      <AsideCartLoader />
    </template>
  </div>
</template>
