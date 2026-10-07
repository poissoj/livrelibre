import type { CustomerOrders, OrderRow } from "@livrelibre/shared/order";
import { STATUS_LABEL } from "@livrelibre/shared/order";

export const sortOrders = (sortBy: string) => {
  switch (sortBy) {
    case "distributor":
      return (a: OrderRow, b: OrderRow) => (a.distributor || "").localeCompare(b.distributor || "");
    case "distributorDesc":
      return (a: OrderRow, b: OrderRow) => (b.distributor || "").localeCompare(a.distributor || "");
    case "status":
      return (a: OrderRow, b: OrderRow) =>
        STATUS_LABEL[a.ordered].localeCompare(STATUS_LABEL[b.ordered]);
    case "statusDesc":
      return (a: OrderRow, b: OrderRow) =>
        STATUS_LABEL[b.ordered].localeCompare(STATUS_LABEL[a.ordered]);
    case "name":
      return (a: OrderRow, b: OrderRow) => a.customerName.localeCompare(b.customerName);
    case "nameDesc":
      return (a: OrderRow, b: OrderRow) => b.customerName.localeCompare(a.customerName);
    case "date":
      return (a: OrderRow, b: OrderRow) => a.created.getTime() - b.created.getTime();
    case "dateDesc":
      return (a: OrderRow, b: OrderRow) => b.created.getTime() - a.created.getTime();
    default:
      return () => 0;
  }
};

export const sortGroups = (sortBy: string) => {
  switch (sortBy) {
    case "name":
      return (a: CustomerOrders, b: CustomerOrders) =>
        a.customer.name.localeCompare(b.customer.name);
    case "nameDesc":
      return (a: CustomerOrders, b: CustomerOrders) =>
        b.customer.name.localeCompare(a.customer.name);
    case "date":
      return (a: CustomerOrders, b: CustomerOrders) => a.maxDate.getTime() - b.maxDate.getTime();
    case "dateDesc":
      return (a: CustomerOrders, b: CustomerOrders) => b.maxDate.getTime() - a.maxDate.getTime();
    default:
      return () => 0;
  }
};

export const DEFAULT_SORTBY = "dateDesc";
