<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import Card from "@/components/Card.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import ItemCard from "@/components/ItemCard.vue";
import ItemSalesCard from "@/components/ItemSalesCard.vue";
import NoResults from "@/components/NoResults.vue";
import Title from "@/components/Title.vue";

const route = useRoute();
const id = computed(() => route.params.id);
const isValidId = computed(
  () => typeof id.value === "string" && /^\d+$/.test(id.value),
);
const idNum = computed(() => Number(id.value));
</script>

<template>
  <div class="flex items-start gap-lg flex-1 flex-wrap">
    <Title>Voir un article</Title>
    <Card v-if="!isValidId" class="flex-1">
      <CardTitle>Article introuvable</CardTitle>
      <CardBody>
        <NoResults />
      </CardBody>
    </Card>
    <template v-else>
      <ItemCard :id="idNum" />
      <div class="flex flex-col gap-lg flex-1">
        <ItemSalesCard :id="idNum" />
      </div>
    </template>
  </div>
</template>
