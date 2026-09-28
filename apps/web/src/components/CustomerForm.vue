<script setup lang="ts">
import { ref } from "vue";

import AppAlert from "@/components/AppAlert.vue";
import AppCard from "@/components/AppCard.vue";
import AppInput from "@/components/AppInput.vue";
import AppTextarea from "@/components/AppTextarea.vue";
import CardBody from "@/components/CardBody.vue";
import CardFooter from "@/components/CardFooter.vue";
import CardTitle from "@/components/CardTitle.vue";
import FormRow from "@/components/FormRow.vue";
import { getErrorMessage } from "@/utils/errors";

import type { CustomerFormFields, CustomerFormResult } from "./customerForm";
import type { AlertMessage } from "./form";

const props = defineProps<{
  title: string;
  data?: CustomerFormFields | undefined;
  onSubmit: (data: CustomerFormFields) => Promise<CustomerFormResult>;
}>();

const fullname = ref(props.data?.fullname ?? "");
const phone = ref(props.data?.phone ?? "");
const email = ref(props.data?.email ?? "");
const contact = ref(props.data?.contact ?? "");
const comment = ref(props.data?.comment ?? "");
const alert = ref<AlertMessage | null>(null);

const buildPayload = (): CustomerFormFields => ({
  fullname: fullname.value,
  phone: phone.value || null,
  email: email.value || null,
  contact: contact.value,
  comment: comment.value,
});

const reset = () => {
  fullname.value = "";
  phone.value = "";
  email.value = "";
  contact.value = "";
  comment.value = "";
};

const submit = async () => {
  try {
    const { type, msg: message } = await props.onSubmit(buildPayload());
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
    <CardTitle>{{ props.title }}</CardTitle>
    <form class="flex-1 flex flex-col h-0" @submit.prevent="submit">
      <CardBody class="flex-col gap-5">
        <div class="flex flex-wrap flex-col">
          <FormRow label="Nom complet">
            <AppInput v-model="fullname" type="text" required />
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
