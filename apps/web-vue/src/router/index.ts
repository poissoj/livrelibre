import { createRouter, createWebHistory } from "vue-router";

import ProtectedLayout from "@/components/Layout/ProtectedLayout.vue";
import Custom404 from "@/pages/404.vue";
import Add from "@/pages/add.vue";
import Advanced from "@/pages/advanced.vue";
import SearchResults from "@/pages/advancedSearch.vue";
import Dashboard from "@/pages/index.vue";
import ItemPage from "@/pages/item/[id].vue";
import Items from "@/pages/items.vue";
import Login from "@/pages/login.vue";
import QuickSearchPage from "@/pages/quicksearch.vue";
import Search from "@/pages/search.vue";
import UpdateItem from "@/pages/update/[itemId].vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: Login,
      meta: { public: true },
    },
    {
      path: "/",
      component: ProtectedLayout,
      children: [
        { path: "", name: "dashboard", component: Dashboard },
        { path: "items", name: "items", component: Items },
        { path: "item/:id", name: "item", component: ItemPage },
        { path: "update/:itemId", name: "update-item", component: UpdateItem },
        { path: "add", name: "add", component: Add },
        { path: "search", name: "search", component: Search },
        {
          path: "advancedSearch",
          name: "advanced-search",
          component: SearchResults,
        },
        { path: "advanced", name: "advanced", component: Advanced },
        {
          path: "quicksearch",
          name: "quicksearch",
          component: QuickSearchPage,
        },
        {
          path: ":pathMatch(.*)*",
          name: "not-found",
          component: Custom404,
        },
      ],
    },
  ],
});
