import { createRouter, createWebHistory } from "vue-router";

import ProtectedLayout from "@/components/Layout/ProtectedLayout.vue";
import { APP_NAME } from "@/lib/config";

const Custom404 = () => import("@/pages/404.vue");
const Add = () => import("@/pages/add.vue");
const Advanced = () => import("@/pages/advanced.vue");
const SearchResults = () => import("@/pages/advancedSearch.vue");
const BestSales = () => import("@/pages/best-sales.vue");
const CartPage = () => import("@/pages/cart.vue");
const UpdateCustomer = () => import("@/pages/customer/[customerId].vue");
const NewCustomer = () => import("@/pages/customer/new.vue");
const Customers = () => import("@/pages/customers.vue");
const Dashboard = () => import("@/pages/index.vue");
const ItemPage = () => import("@/pages/item/[id].vue");
const Items = () => import("@/pages/items.vue");
const Login = () => import("@/pages/login.vue");
const UpdateOrder = () => import("@/pages/order/[orderId].vue");
const NewOrder = () => import("@/pages/order/new.vue");
const Orders = () => import("@/pages/orders.vue");
const QuickSearchPage = () => import("@/pages/quicksearch.vue");
const SalesByMonth = () => import("@/pages/sale/[year]/[month].vue");
const SalesByDayPage = () => import("@/pages/sale/[year]/[month]/[day].vue");
const Sales = () => import("@/pages/sales.vue");
const Search = () => import("@/pages/search.vue");
const Stats = () => import("@/pages/stats.vue");
const TodaySales = () => import("@/pages/todaySales.vue");
const UpdateItem = () => import("@/pages/update/[itemId].vue");

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: Login,
      meta: { title: "Se connecter" },
    },
    {
      path: "/",
      component: ProtectedLayout,
      children: [
        {
          path: "",
          name: "dashboard",
          component: Dashboard,
          meta: { title: "Tableau de bord" },
        },
        {
          path: "items",
          name: "items",
          component: Items,
          meta: { title: "Liste des articles" },
        },
        {
          path: "item/:id",
          name: "item",
          component: ItemPage,
          meta: { title: "Voir un article" },
        },
        {
          path: "update/:itemId",
          name: "update-item",
          component: UpdateItem,
          meta: { title: "Modifier un article" },
        },
        {
          path: "add",
          name: "add",
          component: Add,
          meta: { title: "Ajouter un article" },
        },
        {
          path: "customers",
          name: "customers",
          component: Customers,
          meta: { title: "Liste des client⋅es" },
        },
        {
          path: "customer/new",
          name: "customer-new",
          component: NewCustomer,
          meta: { title: "Ajouter un client" },
        },
        {
          path: "customer/:customerId",
          name: "customer",
          component: UpdateCustomer,
          meta: { title: "Modifier un client" },
        },
        {
          path: "orders",
          name: "orders",
          component: Orders,
          meta: { title: "Liste des commandes" },
        },
        {
          path: "order/new",
          name: "order-new",
          component: NewOrder,
          meta: { title: "Nouvelle commande" },
        },
        {
          path: "order/:orderId",
          name: "order",
          component: UpdateOrder,
          meta: { title: "Modifier une commande" },
        },
        {
          path: "search",
          name: "search",
          component: Search,
          meta: { title: "Chercher un article" },
        },
        {
          path: "cart",
          name: "cart",
          component: CartPage,
          meta: { title: "Panier" },
        },
        {
          path: "sales",
          name: "sales",
          component: Sales,
          meta: { title: "Liste des ventes par mois" },
        },
        {
          path: "sale/:year/:month",
          name: "sale-month",
          component: SalesByMonth,
          meta: { title: "Ventes du mois" },
        },
        {
          path: "sale/:year/:month/:day",
          name: "sale-day",
          component: SalesByDayPage,
          meta: { title: "Ventes du jour" },
        },
        {
          path: "todaySales",
          name: "today-sales",
          component: TodaySales,
          meta: { title: "Ventes du jour" },
        },
        {
          path: "best-sales",
          name: "best-sales",
          component: BestSales,
          meta: { title: "Meilleures ventes" },
        },
        {
          path: "stats",
          name: "stats",
          component: Stats,
          meta: { title: "Statistiques" },
        },
        {
          path: "advancedSearch",
          name: "advanced-search",
          component: SearchResults,
          meta: { title: "Recherche avancée" },
        },
        {
          path: "advanced",
          name: "advanced",
          component: Advanced,
          meta: { title: "Avancé" },
        },
        {
          path: "quicksearch",
          name: "quicksearch",
          component: QuickSearchPage,
          meta: { title: "Recherche rapide" },
        },
        {
          path: ":pathMatch(.*)*",
          name: "not-found",
          component: Custom404,
          meta: { title: "Page introuvable" },
        },
      ],
    },
  ],
});

router.afterEach((to) => {
  const title = typeof to.meta.title === "string" ? to.meta.title : "";
  document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
});
