<script setup lang="ts">
import {
  faBook,
  faChartLine,
  faChartPie,
  faEdit,
  faFileAlt,
  faLaptop,
  faSearchPlus,
  faTachometerAlt,
  faThList,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { computed } from "vue";

import useUser from "@/lib/useUser";

import NavLink from "./NavLink.vue";

const { user } = useUser();
const salesPage = computed(() => (user.value?.role === "admin" ? "/sales" : "/todaySales"));
</script>

<template>
  <nav aria-label="Navigation principale" class="w-56 bg-gray text-white">
    <ul>
      <li>
        <NavLink href="/" :icon="faTachometerAlt">Tableau de bord</NavLink>
      </li>
      <li>
        <NavLink href="/search" :icon="faSearchPlus">Recherche avancée</NavLink>
      </li>
      <li>
        <NavLink href="/add" :icon="faEdit">Ajouter un article</NavLink>
      </li>
      <li>
        <NavLink :href="salesPage" :icon="faThList">Ventes</NavLink>
      </li>
      <li>
        <hr class="mx-lg my-md" />
      </li>
      <li>
        <NavLink href="/orders" :icon="faBook">Commandes</NavLink>
      </li>
      <li>
        <NavLink href="/customers" :icon="faUsers">Client⋅es</NavLink>
      </li>
      <li>
        <hr class="mx-lg my-md" />
      </li>
      <li>
        <NavLink href="/items" :icon="faFileAlt">Articles</NavLink>
      </li>
      <li>
        <NavLink href="/best-sales" :icon="faChartLine">Meilleures ventes</NavLink>
      </li>
      <li>
        <NavLink href="/stats" :icon="faChartPie">Statistiques</NavLink>
      </li>
      <li>
        <NavLink href="/advanced" :icon="faLaptop">Avancé…</NavLink>
      </li>
    </ul>
  </nav>
</template>
