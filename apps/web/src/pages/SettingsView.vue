<script setup lang="ts">
import AppCard from "@/components/AppCard.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import RestrictedContent from "@/components/RestrictedContent.vue";
import ItemTypesTable from "@/components/settings/ItemTypesTable.vue";
import LoyaltyDiscountForm from "@/components/settings/LoyaltyDiscountForm.vue";
</script>

<template>
  <RestrictedContent role="admin">
    <h1 class="sr-only">Réglages</h1>
    <div class="flex-1 flex flex-col gap-lg overflow-auto">
      <AppCard class="min-h-60 max-h-full overflow-hidden flex flex-col">
        <CardTitle>Types d'article</CardTitle>
        <CardBody>
          <ItemTypesTable />
        </CardBody>
      </AppCard>
      <AppCard class="flex flex-col">
        <CardTitle>Remise fidélité</CardTitle>
        <CardBody>
          <LoyaltyDiscountForm />
        </CardBody>
      </AppCard>
    </div>
  </RestrictedContent>
</template>
