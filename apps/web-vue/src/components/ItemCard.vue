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
import { ContentLoader } from "vue-content-loader";
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
import Title from "@/components/Title.vue";
import { useTRPCQuery, useTRPCUtils } from "@/utils/query";
import { useAddToCart } from "@/utils/useAddToCart";
import { useBookmark } from "@/utils/useBookmark";

const props = defineProps<{ id: number }>();

const route = useRoute();
const router = useRouter();
const utils = useTRPCUtils();

const result = useTRPCQuery("searchItem", props.id);
const orders = useTRPCQuery("itemOrders", props.id);

const { star, mutation: bookmarkMutation } = useBookmark();
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
  <Card v-if="result.isError.value" class="flex-1">
    <CardTitle>Article en erreur</CardTitle>
    <CardBody>
      <ErrorMessage />
    </CardBody>
  </Card>
  <Card v-else-if="result.isPending.value" class="flex-1">
    <CardTitle>Chargement…</CardTitle>
    <CardBody>
      <ContentLoader :height="500" width="100%">
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
      </ContentLoader>
    </CardBody>
  </Card>
  <Card v-else-if="result.data.value == null" class="flex-1">
    <CardTitle>Article introuvable</CardTitle>
    <CardBody>
      <NoResults />
    </CardBody>
  </Card>
  <Card v-else class="flex-1 max-h-full flex flex-col">
    <Title>{{ `${result.data.value.title} | Voir un article` }}</Title>
    <div class="flex items-center">
      <CardTitle class="mr-auto">{{ result.data.value.title }}</CardTitle>
      <LinkButton
        :to="`/order/new?item=${String(props.id)}`"
        title="Commander"
        class="rounded-r-none px-md"
      >
        <FontAwesomeIcon :icon="faBook" />
      </LinkButton>
      <Button
        type="button"
        :title="
          result.data.value.starred
            ? 'Enlever des favoris'
            : 'Ajouter aux favoris'
        "
        class="rounded-none px-md border-primary-darkest"
        @click="star(props.id, !result.data.value.starred)"
      >
        <FontAwesomeIcon
          :icon="
            bookmarkMutation.isPending.value
              ? faSpinner
              : result.data.value.starred
                ? faStar
                : emptyStar
          "
          :spin="bookmarkMutation.isPending.value"
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
        :on-dismiss="dismissStatus"
      >
        {{ result.data.value.title }} modifié.
      </Alert>
      <ItemDetails :item="result.data.value" :orders="orders.data.value" />
    </CardBody>
    <CardFooter>
      <form class="flex justify-end" @submit.prevent="submitAddToCart">
        <label>
          <span class="font-medium mr-2">Quantité</span>
          <Input
            v-model="quantity"
            type="number"
            :min="1"
            :max="result.data.value.amount"
            :step="1"
            class="font-number !w-20"
          />
        </label>
        <Button
          type="submit"
          class="ml-2 px-md"
          :disabled="result.data.value.amount === 0"
        >
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
