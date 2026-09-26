<script setup lang="ts">
import { faStar as emptyStar } from "@fortawesome/free-regular-svg-icons";
import {
  faBook,
  faCartPlus,
  faEdit,
  faSpinner,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import Alert from "@/components/Alert.vue";
import Button from "@/components/Button.vue";
import Card from "@/components/Card.vue";
import CardBody from "@/components/CardBody.vue";
import CardFooter from "@/components/CardFooter.vue";
import CardTitle from "@/components/CardTitle.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import Input from "@/components/Input.vue";
import ItemDetails from "@/components/ItemDetails.vue";
import LinkButton from "@/components/LinkButton.vue";
import NoResults from "@/components/NoResults.vue";
import Skeleton from "@/components/Skeleton.vue";
import { useTitle } from "@/lib/useTitle";
import { useTRPCQuery, useTRPCUtils } from "@/utils/query";
import { useAddToCart } from "@/utils/useAddToCart";
import { useBookmark } from "@/utils/useBookmark";

const props = defineProps<{ id: number }>();

const route = useRoute();
const router = useRouter();
const utils = useTRPCUtils();

const { data: item, isPending, isError } = useTRPCQuery("searchItem", props.id);
const { data: orders } = useTRPCQuery("itemOrders", props.id);

useTitle(() =>
  item.value ? `${item.value.title} | Voir un article` : "Voir un article",
);

const { star, mutation: bookmarkMutation } = useBookmark();
const bookmarkPending = bookmarkMutation.isPending;
const { mutate: addToCart, isPending: addPending } = useAddToCart();
const quantity = ref("1");

const dismissStatus = () => {
  void router.push(`/item/${String(props.id)}`);
};

const submitAddToCart = () => {
  addToCart(
    { id: props.id, quantity: Number(quantity.value) },
    {
      onSuccess() {
        void utils.invalidate("searchItem");
      },
    },
  );
};
</script>

<template>
  <Card v-if="isError" class="flex-1">
    <CardTitle>Article en erreur</CardTitle>
    <CardBody>
      <ErrorMessage />
    </CardBody>
  </Card>
  <Card v-else-if="isPending" class="flex-1">
    <CardTitle>Chargement…</CardTitle>
    <CardBody>
      <Skeleton :height="500">
        <template v-for="n in 14" :key="n">
          <rect
            x="2%"
            :y="(n - 1) * 35 + 5"
            rx="5"
            ry="5"
            width="20%"
            height="12"
          />
          <rect
            x="30%"
            :y="(n - 1) * 35 + 6"
            rx="5"
            ry="5"
            width="60%"
            height="10"
          />
        </template>
      </Skeleton>
    </CardBody>
  </Card>
  <Card v-else-if="item == null" class="flex-1">
    <CardTitle>Article introuvable</CardTitle>
    <CardBody>
      <NoResults />
    </CardBody>
  </Card>
  <Card v-else class="flex-1 max-h-full flex flex-col">
    <div class="flex items-center">
      <CardTitle class="mr-auto">{{ item.title }}</CardTitle>
      <LinkButton
        :to="`/order/new?item=${String(props.id)}`"
        title="Commander"
        class="rounded-r-none px-md"
      >
        <FontAwesomeIcon :icon="faBook" />
      </LinkButton>
      <Button
        type="button"
        :title="item.starred ? 'Enlever des favoris' : 'Ajouter aux favoris'"
        class="rounded-none px-md border-primary-darkest"
        @click="star(props.id, !item.starred)"
      >
        <FontAwesomeIcon
          :icon="
            bookmarkPending ? faSpinner : item.starred ? faStar : emptyStar
          "
          :spin="bookmarkPending"
        />
      </Button>
      <LinkButton
        :to="`/update/${String(props.id)}`"
        title="Modifier"
        class="rounded-l-none px-md"
      >
        <FontAwesomeIcon :icon="faEdit" />
      </LinkButton>
    </div>
    <CardBody class="flex-col">
      <Alert
        v-if="route.query.status === 'updated'"
        type="success"
        @dismiss="dismissStatus"
      >
        {{ item.title }} modifié.
      </Alert>
      <ItemDetails :item="item" :orders="orders" />
    </CardBody>
    <CardFooter>
      <form class="flex justify-end" @submit.prevent="submitAddToCart">
        <label>
          <span class="font-medium mr-2">Quantité</span>
          <Input
            v-model="quantity"
            type="number"
            :min="1"
            :max="item.amount"
            :step="1"
            class="font-number !w-20"
          />
        </label>
        <Button type="submit" class="ml-2 px-md" :disabled="item.amount === 0">
          <FontAwesomeIcon
            :icon="addPending ? faSpinner : faCartPlus"
            :spin="addPending"
            class="mr-2"
          />
          Ajouter au panier
        </Button>
      </form>
    </CardFooter>
  </Card>
</template>
