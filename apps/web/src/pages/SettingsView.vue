<script setup lang="ts">
import AppCard from "@/components/AppCard.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import RestrictedContent from "@/components/RestrictedContent.vue";
import ItemTypesTable from "@/components/settings/ItemTypesTable.vue";
import { useTitle } from "@/lib/useTitle";

useTitle("Réglages");
</script>

<template>
  <RestrictedContent role="admin">
    <h1 class="sr-only">Réglages</h1>
    <div class="flex-1 flex flex-col gap-lg">
      <AppCard class="max-h-full overflow-hidden flex flex-col">
        <CardTitle>Types d'article</CardTitle>
        <CardBody>
          <ItemTypesTable />
        </CardBody>
      </AppCard>
    </div>
  </RestrictedContent>
</template>
