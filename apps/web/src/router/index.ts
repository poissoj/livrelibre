import { createRouter, createWebHistory } from "vue-router";

import ProtectedLayout from "@/components/Layout/ProtectedLayout.vue";
import { APP_NAME } from "@/lib/config";

const NotFoundView = () => import("@/pages/NotFoundView.vue");
const AddItemView = () => import("@/pages/AddItemView.vue");
const AdvancedView = () => import("@/pages/AdvancedView.vue");
const AdvancedSearchView = () => import("@/pages/AdvancedSearchView.vue");
const BestSalesView = () => import("@/pages/BestSalesView.vue");
const CartView = () => import("@/pages/CartView.vue");
const CustomerView = () => import("@/pages/CustomerView.vue");
const NewCustomerView = () => import("@/pages/NewCustomerView.vue");
const CustomersView = () => import("@/pages/CustomersView.vue");
const DashboardView = () => import("@/pages/DashboardView.vue");
const ItemView = () => import("@/pages/ItemView.vue");
const ItemsView = () => import("@/pages/ItemsView.vue");
const LoginView = () => import("@/pages/LoginView.vue");
const OrderView = () => import("@/pages/OrderView.vue");
const NewOrderView = () => import("@/pages/NewOrderView.vue");
const OrdersView = () => import("@/pages/OrdersView.vue");
const QuickSearchView = () => import("@/pages/QuickSearchView.vue");
const SalesByMonthView = () => import("@/pages/SalesByMonthView.vue");
const SalesByDayView = () => import("@/pages/SalesByDayView.vue");
const SalesView = () => import("@/pages/SalesView.vue");
const SearchView = () => import("@/pages/SearchView.vue");
const StatsView = () => import("@/pages/StatsView.vue");
const TodaySalesView = () => import("@/pages/TodaySalesView.vue");
const UpdateItemView = () => import("@/pages/UpdateItemView.vue");

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: { title: "Se connecter" },
    },
    {
      path: "/",
      component: ProtectedLayout,
      children: [
        {
          path: "",
          name: "dashboard",
          component: DashboardView,
          meta: { title: "Tableau de bord" },
        },
        {
          path: "items",
          name: "items",
          component: ItemsView,
          meta: { title: "Liste des articles" },
        },
        {
          path: "item/:id",
          name: "item",
          component: ItemView,
          meta: { title: "Voir un article" },
        },
        {
          path: "update/:itemId",
          name: "update-item",
          component: UpdateItemView,
          meta: { title: "Modifier un article" },
        },
        {
          path: "add",
          name: "add",
          component: AddItemView,
          meta: { title: "Ajouter un article" },
        },
        {
          path: "customers",
          name: "customers",
          component: CustomersView,
          meta: { title: "Liste des client⋅es" },
        },
        {
          path: "customer/new",
          name: "customer-new",
          component: NewCustomerView,
          meta: { title: "Ajouter un client" },
        },
        {
          path: "customer/:customerId",
          name: "customer",
          component: CustomerView,
          meta: { title: "Modifier un client" },
        },
        {
          path: "orders",
          name: "orders",
          component: OrdersView,
          meta: { title: "Liste des commandes" },
        },
        {
          path: "order/new",
          name: "order-new",
          component: NewOrderView,
          meta: { title: "Nouvelle commande" },
        },
        {
          path: "order/:orderId",
          name: "order",
          component: OrderView,
          meta: { title: "Modifier une commande" },
        },
        {
          path: "search",
          name: "search",
          component: SearchView,
          meta: { title: "Chercher un article" },
        },
        {
          path: "cart",
          name: "cart",
          component: CartView,
          meta: { title: "Panier" },
        },
        {
          path: "sales",
          name: "sales",
          component: SalesView,
          meta: { title: "Liste des ventes par mois" },
        },
        {
          path: "sale/:year/:month",
          name: "sale-month",
          component: SalesByMonthView,
          meta: { title: "Ventes du mois" },
        },
        {
          path: "sale/:year/:month/:day",
          name: "sale-day",
          component: SalesByDayView,
          meta: { title: "Ventes du jour" },
        },
        {
          path: "todaySales",
          name: "today-sales",
          component: TodaySalesView,
          meta: { title: "Ventes du jour" },
        },
        {
          path: "best-sales",
          name: "best-sales",
          component: BestSalesView,
          meta: { title: "Meilleures ventes" },
        },
        {
          path: "stats",
          name: "stats",
          component: StatsView,
          meta: { title: "Statistiques" },
        },
        {
          path: "advancedSearch",
          name: "advanced-search",
          component: AdvancedSearchView,
          meta: { title: "Recherche avancée" },
        },
        {
          path: "advanced",
          name: "advanced",
          component: AdvancedView,
          meta: { title: "Avancé" },
        },
        {
          path: "quicksearch",
          name: "quicksearch",
          component: QuickSearchView,
          meta: { title: "Recherche rapide" },
        },
        {
          path: ":pathMatch(.*)*",
          name: "not-found",
          component: NotFoundView,
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
