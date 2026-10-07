<script setup lang="ts">
import { faAt, faPhone, faUserPlus, faWalking } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { toInputDate } from "@livrelibre/shared/date";
import type { Item } from "@livrelibre/shared/item";
import {
  type ContactMean as ContactMeanType,
  type OrderStatus,
  type RawOrder,
  STATUS_LABEL,
} from "@livrelibre/shared/order";
import { ref } from "vue";
import { toast } from "vue-sonner";

import AppButton from "@/components/AppButton.vue";
import AppCard from "@/components/AppCard.vue";
import AppInput from "@/components/AppInput.vue";
import AppSelect from "@/components/AppSelect.vue";
import AppTextarea from "@/components/AppTextarea.vue";
import CardBody from "@/components/CardBody.vue";
import CardFooter from "@/components/CardFooter.vue";
import CardTitle from "@/components/CardTitle.vue";
import ContactMean from "@/components/ContactMean.vue";
import FormRow from "@/components/FormRow.vue";
import OrderCustomerForm from "@/components/OrderCustomerForm.vue";
import type { CustomerSelection, OrderFormData } from "@/components/orderForm";
import SelectCustomer from "@/components/SelectCustomer.vue";
import type { NewItem } from "@/components/selectItem";
import SelectItem from "@/components/SelectItem.vue";
import { getErrorMessage } from "@/utils/errors";
import { useTRPCUtils } from "@/utils/query";

const props = defineProps<{
  title: string;
  data: OrderFormData;
}>();

const emit = defineEmits<{ submit: [order: RawOrder] }>();

const utils = useTRPCUtils();

const customer = ref<CustomerSelection | null>(props.data.customer ?? null);
const item = ref<Item | NewItem | null>(
  props.data.item ?? { id: null, title: props.data.itemTitle ?? "" },
);
const showCustomerForm = ref(false);

const created = ref(toInputDate(props.data.created));
const isbn = ref(props.data.item?.isbn ?? "");
const itemId = ref<number | null>(props.data.itemId ?? null);
const itemTitle = ref(props.data.itemTitle ?? props.data.item?.title ?? "");
const contact = ref<ContactMeanType>(props.data.contact ?? "unknown");
const comment = ref(props.data.comment ?? "");
const nb = ref<number | string>(props.data.nb ?? 1);
const ordered = ref<OrderStatus>(props.data.ordered ?? "new");
const paid = ref(props.data.paid ?? false);
const customerNotified = ref(props.data.customerNotified ?? false);
const customerId = ref<number | null>(props.data.customerId ?? props.data.customer?.id ?? null);

const toggleCustomerForm = () => {
  showCustomerForm.value = !showCustomerForm.value;
};

const updateCustomer = (value: CustomerSelection | null) => {
  customer.value = value;
  customerId.value = value?.id ?? null;
};

const updateItem = (value: Item | NewItem | null) => {
  item.value = value;
  itemId.value = value?.id ?? null;
  itemTitle.value = value?.title ?? "";
  isbn.value = value && "isbn" in value ? value.isbn : "";
};

const submit = async () => {
  try {
    if (isbn.value && !itemId.value) {
      if (!/^\d{10,13}$/.test(isbn.value)) {
        toast.error("ISBN invalide");
        return;
      }
      const result = await utils.fetch("isbnSearch", isbn.value);
      if (result.count === 0) {
        toast.info("Aucun article trouvé pour cet ISBN");
      }
      updateItem(result.items[0] ?? null);
      return;
    }
    if (!customerId.value) {
      toast.info("Merci de sélectionner un⋅e client⋅e");
      return;
    }
    if (!itemTitle.value) {
      toast.info("Merci de renseigner le titre ou l'ISBN de l'article");
      return;
    }
    const parsedDate = new Date(created.value);
    if (Number.isNaN(parsedDate.getTime())) {
      toast.error("Date invalide");
      return;
    }
    emit("submit", {
      created: parsedDate.toISOString(),
      customerId: customerId.value,
      itemId: itemId.value,
      itemTitle: itemTitle.value,
      ordered: ordered.value,
      customerNotified: customerNotified.value,
      paid: paid.value,
      comment: comment.value,
      nb: Number(nb.value),
      contact: contact.value,
    });
  } catch (error) {
    toast.error(getErrorMessage(error));
  }
};
</script>

<template>
  <AppCard class="max-h-full flex flex-col">
    <CardTitle :level="1">{{ props.title }}</CardTitle>
    <form class="contents" @submit.prevent="submit">
      <CardBody class="flex-col gap-5">
        <div class="flex flex-col">
          <FormRow label="Client⋅e" group>
            <AppInput
              v-if="showCustomerForm"
              type="text"
              class="w-full bg-[#ccc] cursor-not-allowed"
              disabled
              value="Nouveau client"
            />
            <SelectCustomer
              v-else
              :customer="customer"
              full-width
              required
              @update:customer="updateCustomer"
            />
            <AppButton
              class="ml-sm self-center"
              aria-label="Nouveau client"
              title="Nouveau client"
              type="button"
              @click="toggleCustomerForm"
            >
              <FontAwesomeIcon :icon="faUserPlus" />
            </AppButton>
          </FormRow>
          <OrderCustomerForm
            v-if="showCustomerForm"
            @add="updateCustomer"
            @hide="toggleCustomerForm"
          />
          <FormRow label="Contacter par" field-class="gap-2" group>
            <ContactMean v-model="contact" mean="unknown" :is-active="contact === 'unknown'">
              Non renseigné
            </ContactMean>
            <ContactMean v-model="contact" mean="in person" :is-active="contact === 'in person'">
              <FontAwesomeIcon :icon="faWalking" class="mr-1" />
              <span>Passera</span>
            </ContactMean>
            <ContactMean v-model="contact" mean="phone" :is-active="contact === 'phone'">
              <FontAwesomeIcon :icon="faPhone" class="mr-1" />
              <em>{{ customer?.phone }}</em>
            </ContactMean>
            <ContactMean v-model="contact" mean="mail" :is-active="contact === 'mail'">
              <FontAwesomeIcon :icon="faAt" class="mr-1" />
              <em>{{ customer?.email }}</em>
            </ContactMean>
          </FormRow>
          <FormRow label="Date">
            <AppInput v-model="created" type="datetime-local" required />
          </FormRow>
          <FormRow label="ISBN">
            <AppInput v-model="isbn" type="text" :maxlength="13" />
          </FormRow>
          <FormRow label="Titre">
            <SelectItem :item="item" full-width @update:item="updateItem" />
          </FormRow>
          <FormRow label="Commentaires">
            <AppTextarea v-model="comment" />
          </FormRow>
          <FormRow label="Nb d'exemplaires">
            <AppInput v-model="nb" type="number" :min="1" required />
          </FormRow>
          <FormRow label="État">
            <AppSelect v-model="ordered">
              <option v-for="[key, label] in Object.entries(STATUS_LABEL)" :key="key" :value="key">
                {{ label }}
              </option>
            </AppSelect>
          </FormRow>
          <FormRow
            label="Payé"
            :field-class="paid ? 'border-r-8 border-[rgba(245,0,0,0.5)] pr-2 min-h-6 w-fit' : ''"
          >
            <input v-model="paid" type="checkbox" />
          </FormRow>
          <FormRow label="Client⋅e informé⋅e">
            <input v-model="customerNotified" type="checkbox" />
          </FormRow>
        </div>
      </CardBody>
      <CardFooter>
        <div class="flex justify-end mb-sm">
          <slot />
        </div>
      </CardFooter>
    </form>
  </AppCard>
</template>
