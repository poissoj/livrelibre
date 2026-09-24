import { createRouter, createWebHistory } from "vue-router";

import ProtectedLayout from "@/components/Layout/ProtectedLayout.vue";
import Custom404 from "@/pages/404.vue";
import Dashboard from "@/pages/index.vue";
import Login from "@/pages/login.vue";

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
        {
          path: ":pathMatch(.*)*",
          name: "not-found",
          component: Custom404,
        },
      ],
    },
  ],
});
