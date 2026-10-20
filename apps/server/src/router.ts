import { cartRoutes } from "./routers/cart";
import { customerRoutes } from "./routers/customers";
import { itemRoutes } from "./routers/items";
import { itemTypeRoutes } from "./routers/itemTypes";
import { orderRoutes } from "./routers/orders";
import { paymentMethodRoutes } from "./routers/paymentMethods";
import { saleRoutes } from "./routers/sales";
import { settingsRoutes } from "./routers/settings";
import { userRoutes } from "./routers/user";
import { router } from "./trpc";

export const appRouter = router({
  ...userRoutes,
  ...itemRoutes,
  ...itemTypeRoutes,
  ...cartRoutes,
  ...customerRoutes,
  ...orderRoutes,
  ...paymentMethodRoutes,
  ...saleRoutes,
  ...settingsRoutes,
});

export type AppRouter = typeof appRouter;
