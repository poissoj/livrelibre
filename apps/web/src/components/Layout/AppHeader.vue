<script setup lang="ts">
import { faShoppingCart, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { clsx } from "clsx";
import { computed } from "vue";
import { RouterLink, useRouter } from "vue-router";

import { APP_NAME } from "@/lib/config";
import useUser from "@/lib/useUser";
import { useTRPCQuery, useTRPCUtils } from "@/utils/query";

import QuickSearch from "./QuickSearch.vue";

const BUTTON_STYLES =
  "text-white [padding:14px_16px] hover:[background-color:rgba(0,0,0,0.1)]";

const { user } = useUser();
const router = useRouter();
const utils = useTRPCUtils();
const cart = useTRPCQuery("cart", undefined);

const cartError = computed(() => cart.isError.value);
const cartCount = computed(() => cart.data.value?.count ?? 0);

const logout = async () => {
  try {
    await fetch("/api/logout", { method: "POST" });
  } catch {
    // Déconnexion locale même si l'appel serveur échoue.
  } finally {
    await utils.reset("user");
    await router.push("/login");
  }
};
</script>

<template>
  <header class="bg-primary-dark text-gray-darker flex items-center pr-lg">
    <RouterLink
      to="/"
      class="bg-primary-dark text-white w-56 block text-center mr-auto font-['Niconne'] text-[26px] leading-[50px]"
    >
      {{ APP_NAME }}
    </RouterLink>
    <QuickSearch />
    <span :class="clsx('text-white', 'ml-md mr-sm')">{{
      user?.name || ""
    }}</span>
    <RouterLink
      to="/cart"
      :class="clsx(BUTTON_STYLES, 'shrink-0')"
      title="Voir le panier"
    >
      <FontAwesomeIcon :icon="faShoppingCart" />
      <span
        v-if="cartError"
        class="[border-radius:10rem] bg-red px-2 py-0.5 [font-size:12px] font-medium"
        title="Panier indisponible"
      >
        !
      </span>
      <span
        v-else-if="cartCount > 0"
        class="[border-radius:10rem] bg-gray-dark px-2 py-0.5 [font-size:12px] font-medium"
      >
        {{ cartCount }}
      </span>
    </RouterLink>
    <button
      :class="BUTTON_STYLES"
      type="button"
      title="Se déconnecter"
      @click="logout"
    >
      <FontAwesomeIcon :icon="faUser" />
    </button>
  </header>
</template>
