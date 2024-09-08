import {
  faInfoCircle,
  faSort,
  faSortAsc,
  faSortDesc,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { useRouter } from "next/router";
import React from "react";
import { toast } from "react-toastify";

import { formatDateFR } from "@/utils/date";
import { type OrderRow, STATUS_LABEL } from "@/utils/order";
import { trpc } from "@/utils/trpc";

import { StatusCircle } from "./StatusCircle";

const DEFAULT_SORTBY = "dateDesc";

const SortButton = ({ label, by: sortBy }: { label: string; by: string }) => {
  const router = useRouter();
  const selected =
    typeof router.query.sortBy === "string"
      ? router.query.sortBy
      : DEFAULT_SORTBY;
  let icon = faSort;
  if (sortBy === selected) {
    icon = faSortDesc;
  } else if (sortBy + "Desc" === selected) {
    icon = faSortAsc;
  }
  const updateSort = () => {
    let by = sortBy;
    if (selected === by) {
      by = selected + "Desc";
    }
    void router.push({ query: { ...router.query, sortBy: by } });
  };
  return (
    <button type="button" onClick={updateSort}>
      {label}
      <FontAwesomeIcon icon={icon} className="ml-2" />
    </button>
  );
};

const sortOrders = (sortBy: string) => {
  switch (sortBy) {
    case "distributor":
      return (a: OrderRow, b: OrderRow) =>
        (a.distributor || "").localeCompare(b.distributor || "");
    case "distributorDesc":
      return (a: OrderRow, b: OrderRow) =>
        (b.distributor || "").localeCompare(a.distributor || "");
    case "status":
      return (a: OrderRow, b: OrderRow) =>
        STATUS_LABEL[a.ordered].localeCompare(STATUS_LABEL[b.ordered]);
    case "statusDesc":
      return (a: OrderRow, b: OrderRow) =>
        STATUS_LABEL[b.ordered].localeCompare(STATUS_LABEL[a.ordered]);
    case "name":
      return (a: OrderRow, b: OrderRow) =>
        a.customerName.localeCompare(b.customerName);
    case "nameDesc":
      return (a: OrderRow, b: OrderRow) =>
        b.customerName.localeCompare(a.customerName);
    case "date":
      return (a: OrderRow, b: OrderRow) =>
        a.created.getTime() - b.created.getTime();
    case "dateDesc":
      return (a: OrderRow, b: OrderRow) =>
        b.created.getTime() - a.created.getTime();
    default:
      return () => 0;
  }
};

const NotifiedCheckbox = ({ item }: { item: OrderRow }) => {
  const utils = trpc.useUtils();
  const mutation = trpc.updateOrder.useMutation({
    async onSuccess(data) {
      if (data.type === "success") {
        toast.success(
          `La commande de "${item.itemTitle}" a été marquée comme ${item.customerNotified ? "non " : ""}prévenue.`,
        );
        await utils.orders.invalidate();
      } else {
        toast.error(data.msg);
      }
    },
  });
  const toggle = async () => {
    const order = {
      ...item,
      customerNotified: !item.customerNotified,
      created: item.created.toISOString(),
    };
    await mutation.mutateAsync({ order, id: item.id });
  };
  return (
    <input
      type="checkbox"
      defaultChecked={item.customerNotified}
      disabled={mutation.isLoading}
      onChange={toggle}
    />
  );
};

const stopPropagation = (e: React.MouseEvent) => {
  e.stopPropagation();
};

export const OrdersTable = ({ items }: { items: OrderRow[] }) => {
  const router = useRouter();
  const sortBy =
    typeof router.query.sortBy === "string"
      ? router.query.sortBy
      : DEFAULT_SORTBY;
  const sortedItems = items.toSorted(sortOrders(sortBy));

  return (
    <table className="flex-1 text-sm">
      <thead>
        <tr className="sticky top-0 bg-white shadow-b shadow-black">
          <th className="text-left pl-2">
            <SortButton label="Date" by="date" />
          </th>
          <th className="text-left pl-1">
            <SortButton label="Nom" by="name" />
          </th>
          <th></th>
          <th className="text-left pl-1">Article</th>
          <th className="text-left pl-1">
            <SortButton label="Distributeur" by="distributor" />
          </th>
          <th className="text-center">
            <SortButton label="État" by="status" />
          </th>
          <th className="text-center">Prévenu⋅e</th>
          <th className="text-center px-1">Payé</th>
          <th className="text-center"></th>
        </tr>
      </thead>
      <tbody className="leading-7">
        {sortedItems.map((item, i) => (
          <tr
            key={i}
            className="cursor-pointer even:bg-gray-light"
            onClick={() =>
              router.push({
                pathname: `/order/${item.id}`,
                query: router.query,
              })
            }
          >
            <td className="pl-2 py-1">{formatDateFR(item.created)}</td>
            <td className="p-1">{item.customerName}</td>
            <td
              className={clsx("w-2", { "bg-[rgba(245,0,0,0.5)]": item.paid })}
            ></td>
            <td className="p-1">
              <div className="leading-4">
                {item.itemTitle}
                {item.nb > 1 && (
                  <span className="font-bold ml-2">({item.nb} ex)</span>
                )}
              </div>
              <div className="italic font-number">{item.isbn}</div>
            </td>
            <td className="p-1">{item.distributor}</td>
            <td className="p-1">
              <StatusCircle status={item.ordered} className="mx-auto" />
            </td>
            <td className="p-1 text-center" onClick={stopPropagation}>
              <NotifiedCheckbox item={item} />
            </td>
            <td className="p-1 text-center">
              <input type="checkbox" disabled checked={item.paid} />
            </td>
            <td className="p-1">
              {item.comment && (
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  title={item.comment}
                  size="lg"
                  style={{ color: "#23a3b9" }}
                />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
