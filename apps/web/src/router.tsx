import { Outlet, createBrowserRouter } from "react-router";

import Layout from "@/components/Layout/Layout";
import useUser from "@/lib/useUser";
import Custom404 from "@/pages/404";
import Add from "@/pages/add";
import AdvancedWrapper from "@/pages/advanced";
import SearchResults from "@/pages/advancedSearch";
import BestSales from "@/pages/best-sales";
import CartPage from "@/pages/cart";
import UpdateCustomer from "@/pages/customer/[customerId]";
import NewCustomer from "@/pages/customer/new";
import Customers from "@/pages/customers";
import Dashboard from "@/pages/index";
import ItemPage from "@/pages/item/[id]";
import Items from "@/pages/items";
import Login from "@/pages/login";
import UpdateOrder from "@/pages/order/[orderId]";
import NewOrder from "@/pages/order/new";
import Orders from "@/pages/orders";
import QuickSearchPage from "@/pages/quicksearch";
import SalesByMonth from "@/pages/sale/[year]/[month]";
import SalesByDayPage from "@/pages/sale/[year]/[month]/[day]";
import Sales from "@/pages/sales";
import Search from "@/pages/search";
import Stats from "@/pages/stats";
import TodaySales from "@/pages/todaySales";
import UpdateItem from "@/pages/update/[itemId]";

function ProtectedLayout() {
  const { isLoggedIn } = useUser({ redirectTo: "/login" });
  if (!isLoggedIn) return null;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "add", element: <Add /> },
      { path: "search", element: <Search /> },
      { path: "advancedSearch", element: <SearchResults /> },
      { path: "advanced", element: <AdvancedWrapper /> },
      { path: "items", element: <Items /> },
      { path: "item/:id", element: <ItemPage /> },
      { path: "update/:itemId", element: <UpdateItem /> },
      { path: "customers", element: <Customers /> },
      { path: "customer/new", element: <NewCustomer /> },
      { path: "customer/:customerId", element: <UpdateCustomer /> },
      { path: "cart", element: <CartPage /> },
      { path: "orders", element: <Orders /> },
      { path: "order/new", element: <NewOrder /> },
      { path: "order/:orderId", element: <UpdateOrder /> },
      { path: "best-sales", element: <BestSales /> },
      { path: "sales", element: <Sales /> },
      { path: "sale/:year/:month", element: <SalesByMonth /> },
      { path: "sale/:year/:month/:day", element: <SalesByDayPage /> },
      { path: "todaySales", element: <TodaySales /> },
      { path: "quicksearch", element: <QuickSearchPage /> },
      { path: "stats", element: <Stats /> },
      { path: "*", element: <Custom404 /> },
    ],
  },
]);
