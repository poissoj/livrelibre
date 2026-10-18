<script setup lang="ts">
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useMutation, useQueryClient } from "@tanstack/vue-query";

import AppButton from "@/components/AppButton.vue";
import BackButton from "@/components/BackButton.vue";
import type { CustomerFormFields } from "@/components/customerForm";
import CustomerForm from "@/components/CustomerForm.vue";
import { queryKeys } from "@/lib/queryKeys";
import { type RouterInput, trpcClient } from "@/utils/trpc";

const queryClient = useQueryClient();
const { mutateAsync: saveCustomer, isPending: savePending } = useMutation({
  mutationFn: (input: RouterInput["updateCustomer"]) => trpcClient.updateCustomer.mutate(input),
  meta: { errorToast: false },
  onSuccess() {
    void queryClient.invalidateQueries({ queryKey: queryKeys.customers.root });
    void queryClient.invalidateQueries({ queryKey: queryKeys.customers.searchRoot });
  },
});

const submit = async (customer: CustomerFormFields) => await saveCustomer({ customer });
</script>

<template>
  <div class="[margin-left:10%] [margin-right:10%] flex-1">
    <CustomerForm title="Ajouter un client" :on-submit="submit">
      <BackButton fallback="/customers" class="mr-2 px-md !bg-gray-medium" />
      <AppButton type="submit" class="px-md" :disabled="savePending">
        <FontAwesomeIcon :icon="faPlus" class="mr-sm" />
        Ajouter
      </AppButton>
    </CustomerForm>
  </div>
</template>
