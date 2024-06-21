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

import { formatDateFR } from "@/utils/date";
import { type Order, STATUS_LABEL } from "@/utils/order";

import { StatusCircle } from "./StatusCircle";

const SortButton = ({ label, by: sortBy }: { label: string; by: string }) => {
  const router = useRouter();
  const selected =
    typeof router.query.sortBy === "string" ? router.query.sortBy : "date";
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
      return (a: Order, b: Order) =>
        (a.item?.distributor || "").localeCompare(b.item?.distributor || "");
    case "distributorDesc":
      return (a: Order, b: Order) =>
        (b.item?.distributor || "").localeCompare(a.item?.distributor || "");
    case "status":
      return (a: Order, b: Order) =>
        STATUS_LABEL[a.ordered].localeCompare(STATUS_LABEL[b.ordered]);
    case "statusDesc":
      return (a: Order, b: Order) =>
        STATUS_LABEL[b.ordered].localeCompare(STATUS_LABEL[a.ordered]);
    case "name":
      return (a: Order, b: Order) =>
        a.customer.fullname.localeCompare(b.customer.fullname);
    case "nameDesc":
      return (a: Order, b: Order) =>
        b.customer.fullname.localeCompare(a.customer.fullname);
    case "date":
      return (a: Order, b: Order) => a.date.getTime() - b.date.getTime();
    case "dateDesc":
      return (a: Order, b: Order) => b.date.getTime() - a.date.getTime();
    default:
      return () => 0;
  }
};

export const OrdersTable = ({ items }: { items: Order[] }) => {
  const router = useRouter();
  const sortBy =
    typeof router.query.sortBy === "string" ? router.query.sortBy : "date";
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
          <th className="text-right">Nb</th>
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
                pathname: `/order/${item._id}`,
                query: router.query,
              })
            }
          >
            <td className="pl-2 py-1">{formatDateFR(item.date)}</td>
            <td className="p-1">{item.customer.fullname}</td>
            <td
              className={clsx("w-2", { "bg-[rgba(245,0,0,0.5)]": item.paid })}
            ></td>
            <td className="p-1">
              <div className="leading-4">{item.itemTitle}</div>
              <div className="italic font-number">{item.item?.isbn}</div>
            </td>
            <td className="p-1 text-right font-number">
              {item.nb > 1 ? item.nb : ""}
            </td>
            <td className="p-1">{item.item?.distributor}</td>
            <td className="p-1">
              <StatusCircle status={item.ordered} className="mx-auto" />
            </td>
            <td className="p-1 text-center">
              <input type="checkbox" disabled checked={item.customerNotified} />
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
