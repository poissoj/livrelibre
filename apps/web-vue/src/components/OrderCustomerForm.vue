<script setup lang="ts">
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { ref } from "vue";
import { toast } from "vue-sonner";

import Button from "@/components/Button.vue";
import FormRow from "@/components/FormRow.vue";
import Input from "@/components/Input.vue";
import Textarea from "@/components/Textarea.vue";
import type {
  CustomerFormFields,
  SelectedCustomer,
} from "@/components/customerForm";
import { getErrorMessage } from "@/utils/errors";
import { useTRPCMutation } from "@/utils/query";

const props = defineProps<{
  onAdd: (customer: SelectedCustomer) => void;
  onHide: () => void;
}>();

const fullname = ref("");
const phone = ref("");
const email = ref("");
const contact = ref("");
const comment = ref("");

const mutation = useTRPCMutation("updateCustomer", {
  meta: { errorToast: false },
});

const submit = async () => {
  if (!fullname.value.trim()) {
    toast.error("Le nom est requis");
    return;
  }
  const customer: CustomerFormFields = {
    fullname: fullname.value,
    phone: phone.value || null,
    email: email.value || null,
    contact: contact.value,
    comment: comment.value,
  };
  try {
    const resp = await mutation.mutateAsync({ customer });
    if (resp.type === "success") {
      toast.success(resp.msg);
      props.onAdd({ ...customer, id: resp.id });
      props.onHide();
    } else {
      toast.error(resp.msg);
    }
  } catch (error) {
    toast.error(getErrorMessage(error));
  }
};
</script>

<template>
  <div class="transition-maxHeight duration-200 overflow-hidden">
    <FormRow label="Nom complet">
      <Input v-model="fullname" type="text" />
    </FormRow>
    <FormRow label="Téléphone">
      <Input v-model="phone" type="tel" />
    </FormRow>
    <FormRow label="Email">
      <Input v-model="email" type="email" />
    </FormRow>
    <FormRow label="Remarque contact">
      <Input v-model="contact" type="text" />
    </FormRow>
    <FormRow label="Commentaires">
      <Textarea v-model="comment" />
    </FormRow>
    <div class="flex justify-end mb-4 mr-20">
      <Button
        type="button"
        class="px-md mr-4 !bg-[#6E6E6E]"
        @click="props.onHide"
      >
        <FontAwesomeIcon :icon="faTimesCircle" class="mr-sm" />
        Annuler
      </Button>
      <Button
        type="button"
        class="px-md"
        :disabled="mutation.isPending.value"
        @click="submit"
      >
        <FontAwesomeIcon :icon="faCheckCircle" class="mr-sm" />
        Ajouter
      </Button>
    </div>
  </div>
</template>
