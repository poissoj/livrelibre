<script setup lang="ts">
import { zCustomer } from "@livrelibre/shared/customer";
import { reactive, ref } from "vue";

import AppAlert from "@/components/AppAlert.vue";
import AppCard from "@/components/AppCard.vue";
import AppInput from "@/components/AppInput.vue";
import AppTextarea from "@/components/AppTextarea.vue";
import CardBody from "@/components/CardBody.vue";
import CardFooter from "@/components/CardFooter.vue";
import CardTitle from "@/components/CardTitle.vue";
import FormRow from "@/components/FormRow.vue";
import { formatValidationIssues, getErrorMessage } from "@/utils/errors";

import type { CustomerFormFields, CustomerFormResult } from "./customerForm";
import type { AlertMessage } from "./form";

const props = defineProps<{
  title: string;
  data?: CustomerFormFields | undefined;
  onSubmit: (data: CustomerFormFields) => Promise<CustomerFormResult>;
}>();

type CustomerFormState = {
  fullname: string;
  phone: string;
  email: string;
  contact: string;
  comment: string;
};

const createEmptyState = (): CustomerFormState => ({
  fullname: "",
  phone: "",
  email: "",
  contact: "",
  comment: "",
});

const form = reactive<CustomerFormState>({
  fullname: props.data?.fullname ?? "",
  phone: props.data?.phone ?? "",
  email: props.data?.email ?? "",
  contact: props.data?.contact ?? "",
  comment: props.data?.comment ?? "",
});
const alert = ref<AlertMessage | null>(null);

const buildPayload = (): CustomerFormFields => ({
  ...form,
  phone: form.phone || null,
  email: form.email || null,
});

const reset = () => {
  Object.assign(form, createEmptyState());
};

const submit = async () => {
  const payload = buildPayload();
  const parsed = zCustomer.safeParse(payload);
  if (!parsed.success) {
    alert.value = { type: "error", message: formatValidationIssues(parsed.error.issues) };
    return;
  }
  try {
    const { type, msg: message } = await props.onSubmit(payload);
    alert.value = { type, message };
    if (type === "success" && props.data === undefined) {
      reset();
    }
  } catch (error) {
    alert.value = { type: "error", message: getErrorMessage(error) };
  }
};
</script>

<template>
  <AppCard class="max-h-full flex flex-col">
    <CardTitle :level="1">{{ props.title }}</CardTitle>
    <form class="flex-1 flex flex-col h-0" @submit.prevent="submit">
      <CardBody class="flex-col gap-5">
        <div class="flex flex-wrap flex-col">
          <FormRow label="Nom complet">
            <AppInput v-model="form.fullname" type="text" required />
          </FormRow>
          <FormRow label="Téléphone">
            <AppInput v-model="form.phone" type="tel" />
          </FormRow>
          <FormRow label="Email">
            <AppInput v-model="form.email" type="email" />
          </FormRow>
          <FormRow label="Remarque contact">
            <AppInput v-model="form.contact" type="text" />
          </FormRow>
          <FormRow label="Commentaires">
            <AppTextarea v-model="form.comment" />
          </FormRow>
        </div>
      </CardBody>
      <CardFooter>
        <div class="flex justify-end mb-sm">
          <slot />
        </div>
        <AppAlert v-if="alert" :type="alert.type" @dismiss="alert = null">
          {{ alert.message }}
        </AppAlert>
      </CardFooter>
    </form>
  </AppCard>
</template>
