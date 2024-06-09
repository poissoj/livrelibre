import { useRouter } from "next/router";
import React from "react";

import { formatDateFR } from "@/utils/date";
import { type Order, STATUS_LABEL } from "@/utils/order";

export const OrdersTable = ({ items }: { items: Order[] }) => {
  const router = useRouter();
  return (
    <table className="flex-1 text-sm">
      <thead>
        <tr className="sticky top-0 bg-white z-10 shadow-sm shadow-black">
          <th className="text-left">Date</th>
          <th className="text-left">Nom</th>
          <th className="text-left">Article</th>
          <th className="text-left">Distributeur</th>
          <th className="text-left">État</th>
          <th className="text-left">Prévenu⋅e</th>
          <th className="text-left px-1">Payé</th>
        </tr>
      </thead>
      <tbody className="leading-7">
        {items.map((item, i) => (
          <tr
            key={i}
            className="cursor-pointer even:bg-gray-light"
            onClick={() => router.push(`/order/${item._id}`)}
          >
            <td className="p-1" title={item.comment}>
              {formatDateFR(item.date)}
            </td>
            <td className="p-1">{item.customer.fullname}</td>
            <td className="p-1">
              <div className="leading-4">{item.itemTitle}</div>
              <div className="italic">{item.item?.isbn}</div>
            </td>
            <td className="p-1">{item.item?.distributor}</td>
            <td className="p-1">{STATUS_LABEL[item.ordered]}</td>
            <td className="p-1 text-center">
              <input type="checkbox" disabled checked={item.customerNotified} />
            </td>
            <td className="p-1 text-center">
              <input type="checkbox" disabled checked={item.paid} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
