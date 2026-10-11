import type { CustomerOrders, OrderRow } from "@livrelibre/shared/order";

type Order = CustomerOrders["orders"][number];

const compareOrders = (reverse: boolean) => (a: Order, b: Order) => {
  const direction = reverse ? -1 : 1;
  return direction * (b.created.getTime() - a.created.getTime() || b.id - a.id);
};

export const groupOrdersByCustomer = (orders: OrderRow[], reverse: boolean): CustomerOrders[] => {
  const groups = new Map<
    number,
    {
      customer: CustomerOrders["customer"];
      orders: Order[];
      maxDate: Date;
    }
  >();
  for (const order of orders) {
    const group = groups.get(order.customerId);
    if (!group) {
      groups.set(order.customerId, {
        customer: {
          email: order.email,
          phone: order.phone,
          name: order.customerName,
        },
        orders: [order],
        maxDate: order.created,
      });
      continue;
    }
    if (order.created > group.maxDate) {
      group.maxDate = order.created;
    }
    group.orders.push(order);
  }
  return [...groups.values()].map((group) => {
    group.orders.sort(compareOrders(reverse));
    return group;
  });
};
