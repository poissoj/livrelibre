<script setup lang="ts">
import AppCard from "@/components/AppCard.vue";
import CardBody from "@/components/CardBody.vue";
import CardTitle from "@/components/CardTitle.vue";
import RestrictedContent from "@/components/RestrictedContent.vue";
import ItemTypesTable from "@/components/settings/ItemTypesTable.vue";
import LoyaltyDiscountForm from "@/components/settings/LoyaltyDiscountForm.vue";
import PaymentMethodsTable from "@/components/settings/PaymentMethodsTable.vue";
</script>

<template>
  <RestrictedContent role="admin">
    <h1 class="sr-only">Réglages</h1>
    <div class="flex-1 flex flex-col gap-lg self-start">
      <AppCard aria-label="Types d'article" class="min-h-60 shrink-0 flex flex-col">
        <CardTitle>Types d'article</CardTitle>
        <CardBody :scroll="false">
          <ItemTypesTable />
        </CardBody>
      </AppCard>
      <AppCard aria-label="Moyens de paiement" class="min-h-60 shrink-0 flex flex-col">
        <CardTitle>Moyens de paiement</CardTitle>
        <CardBody :scroll="false">
          <PaymentMethodsTable />
        </CardBody>
      </AppCard>
      <AppCard class="shrink-0 flex flex-col">
        <CardTitle>Remise fidélité</CardTitle>
        <CardBody :scroll="false">
          <LoyaltyDiscountForm />
        </CardBody>
      </AppCard>
    </div>
  </RestrictedContent>
</template>
