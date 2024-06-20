import {
  faInfoCircle,
  faSort,
  faSortDesc,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import React from "react";

import { formatDateFR } from "@/utils/date";
import { type Order, STATUS_LABEL } from "@/utils/order";

import { StatusCircle } from "./StatusCircle";

export const OrdersTable = ({ items }: { items: Order[] }) => {
  const router = useRouter();
  const sortBy =
    typeof router.query.sortBy === "string" ? router.query.sortBy : "date";
  const sortedItems = items.toSorted((a, b) => {
    if (sortBy === "distributor") {
      return (a.item?.distributor || "").localeCompare(
        b.item?.distributor || "",
      );
    }
    if (sortBy === "status") {
      return STATUS_LABEL[a.ordered].localeCompare(STATUS_LABEL[b.ordered]);
    }
    return a.date.getTime() - b.date.getTime();
  });
  const updateSort = (by: string) => () =>
    router.push({ query: { ...router.query, sortBy: by } });

  return (
    <table className="flex-1 text-sm">
      <thead>
        <tr className="sticky top-0 bg-white shadow-b shadow-black">
          <th className="text-left pl-2">
            <button type="button" onClick={updateSort("date")}>
              Date
              <FontAwesomeIcon
                icon={sortBy === "date" ? faSortDesc : faSort}
                className="ml-2"
              />
            </button>
          </th>
          <th className="text-left pl-1">Nom</th>
          <th className="text-left pl-1">Article</th>
          <th className="text-left pl-1">
            <button type="button" onClick={updateSort("distributor")}>
              Distributeur
              <FontAwesomeIcon
                icon={sortBy === "distributor" ? faSortDesc : faSort}
                className="ml-2"
              />
            </button>
          </th>
          <th className="text-center">
            <button type="button" onClick={updateSort("status")}>
              État
              <FontAwesomeIcon
                icon={sortBy === "status" ? faSortDesc : faSort}
                className="ml-2"
              />
            </button>
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
            <td className="p-1">
              <div className="leading-4">{item.itemTitle}</div>
              <div className="italic">{item.item?.isbn}</div>
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
