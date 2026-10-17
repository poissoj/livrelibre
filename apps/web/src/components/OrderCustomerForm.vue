<script setup lang="ts">
import { faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { zCustomer } from "@livrelibre/shared/customer";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { ref } from "vue";
import { toast } from "vue-sonner";

import AppButton from "@/components/AppButton.vue";
import AppInput from "@/components/AppInput.vue";
import AppTextarea from "@/components/AppTextarea.vue";
import type { CustomerFormFields, SelectedCustomer } from "@/components/customerForm";
import FormRow from "@/components/FormRow.vue";
import { queryKeys } from "@/lib/queryKeys";
import { formatValidationIssues } from "@/utils/errors";
import { type RouterInput, trpcClient } from "@/utils/trpc";

const emit = defineEmits<{
  add: [customer: SelectedCustomer];
  hide: [];
}>();

const fullname = ref("");
const phone = ref("");
const email = ref("");
const contact = ref("");
const comment = ref("");

const queryClient = useQueryClient();
const { mutateAsync: createCustomer, isPending: isSubmitting } = useMutation({
  mutationFn: (input: RouterInput["updateCustomer"]) => trpcClient.updateCustomer.mutate(input),
  onSuccess() {
    void queryClient.invalidateQueries({ queryKey: queryKeys.customers.root });
    void queryClient.invalidateQueries({ queryKey: queryKeys.customers.searchRoot });
  },
});

const submit = async () => {
  const customer: CustomerFormFields = {
    fullname: fullname.value,
    phone: phone.value || null,
    email: email.value || null,
    contact: contact.value,
    comment: comment.value,
  };
  const parsed = zCustomer.safeParse(customer);
  if (!parsed.success) {
    toast.error(formatValidationIssues(parsed.error.issues));
    return;
  }
  try {
    const resp = await createCustomer({ customer });
    if (resp.type === "success") {
      toast.success(resp.msg);
      emit("add", { ...customer, id: resp.id });
      emit("hide");
    } else {
      toast.error(resp.msg);
    }
  } catch {
    // Handled by the global mutation error handler.
  }
};
</script>

<template>
  <div class="transition-maxHeight duration-200 overflow-hidden">
    <FormRow label="Nom complet">
      <AppInput v-model="fullname" type="text" />
    </FormRow>
    <FormRow label="Téléphone">
      <AppInput v-model="phone" type="tel" />
    </FormRow>
    <FormRow label="Email">
      <AppInput v-model="email" type="email" />
    </FormRow>
    <FormRow label="Remarque contact">
      <AppInput v-model="contact" type="text" />
    </FormRow>
    <FormRow label="Commentaires">
      <AppTextarea v-model="comment" />
    </FormRow>
    <div class="flex justify-end mb-4 mr-20">
      <AppButton type="button" class="px-md mr-4 !bg-gray-medium" @click="emit('hide')">
        <FontAwesomeIcon :icon="faTimesCircle" class="mr-sm" />
        Annuler
      </AppButton>
      <AppButton type="button" class="px-md" :disabled="isSubmitting" @click="submit">
        <FontAwesomeIcon :icon="faCheckCircle" class="mr-sm" />
        Ajouter
      </AppButton>
    </div>
  </div>
</template>
