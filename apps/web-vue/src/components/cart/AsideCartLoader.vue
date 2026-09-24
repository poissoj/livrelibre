<script setup lang="ts">
import { formatPrice } from "@livrelibre/shared/format";

import Card from "@/components/Card.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import { useTRPCQuery } from "@/utils/query";

import ReactivateButton from "./ReactivateButton.vue";

const result = useTRPCQuery("asideCart", undefined);
</script>

<template>
  <Card v-if="result.isError.value">
    <CardTitle>Panier en attente</CardTitle>
    <CardBody>
      <ErrorMessage />
    </CardBody>
  </Card>
  <Card
    v-else-if="result.isSuccess.value && (result.data.value?.count ?? 0) > 0"
  >
    <CardTitle>Panier en attente</CardTitle>
    <CardBody>
      <div class="flex flex-1 justify-between">
        <p>
          <span class="font-number">{{ result.data.value?.count }}</span>
          article{{ (result.data.value?.count ?? 0) > 1 ? "s" : "" }}
          en attente pour
          <span class="font-number ml-2">
            {{ formatPrice(result.data.value?.total ?? 0) }}
          </span>
        </p>
        <ReactivateButton />
      </div>
    </CardBody>
  </Card>
</template>
