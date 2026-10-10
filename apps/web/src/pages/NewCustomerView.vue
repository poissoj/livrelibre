<script setup lang="ts">
import { faPlus, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useMutation } from "@tanstack/vue-query";

import AppButton from "@/components/AppButton.vue";
import type { CustomerFormFields } from "@/components/customerForm";
import CustomerForm from "@/components/CustomerForm.vue";
import LinkButton from "@/components/LinkButton.vue";
import { type RouterInput, trpcClient } from "@/utils/trpc";

const { mutateAsync: saveCustomer, isPending: savePending } = useMutation({
  mutationFn: (input: RouterInput["updateCustomer"]) => trpcClient.updateCustomer.mutate(input),
  meta: { errorToast: false },
});

const submit = async (customer: CustomerFormFields) => await saveCustomer({ customer });
</script>

<template>
  <div class="[margin-left:10%] [margin-right:10%] flex-1">
    <CustomerForm title="Ajouter un client" :on-submit="submit">
      <LinkButton to="/customers" class="mr-2 px-md !bg-gray-medium">
        <FontAwesomeIcon :icon="faTimesCircle" class="mr-sm" />
        Retour
      </LinkButton>
      <AppButton type="submit" class="px-md" :disabled="savePending">
        <FontAwesomeIcon :icon="faPlus" class="mr-sm" />
        Ajouter
      </AppButton>
    </CustomerForm>
  </div>
</template>
