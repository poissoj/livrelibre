import { createRouter, createWebHistory } from "vue-router";

import ProtectedLayout from "@/components/Layout/ProtectedLayout.vue";

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
        { path: "customers", name: "customers", component: Customers },
        { path: "customer/new", name: "customer-new", component: NewCustomer },
        {
          path: "customer/:customerId",
          name: "customer",
          component: UpdateCustomer,
        },
        { path: "orders", name: "orders", component: Orders },
        { path: "order/new", name: "order-new", component: NewOrder },
        {
          path: "order/:orderId",
          name: "order",
          component: UpdateOrder,
        },
        { path: "search", name: "search", component: Search },
        { path: "cart", name: "cart", component: CartPage },
        { path: "sales", name: "sales", component: Sales },
        {
          path: "sale/:year/:month",
          name: "sale-month",
          component: SalesByMonth,
        },
        {
          path: "sale/:year/:month/:day",
          name: "sale-day",
          component: SalesByDayPage,
        },
        { path: "todaySales", name: "today-sales", component: TodaySales },
        { path: "best-sales", name: "best-sales", component: BestSales },
        { path: "stats", name: "stats", component: Stats },
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
