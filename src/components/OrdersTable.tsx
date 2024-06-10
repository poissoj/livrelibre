import { useRouter } from "next/router";
import React from "react";

import { formatDateFR } from "@/utils/date";
import { type Order, STATUS_COLOR, STATUS_LABEL } from "@/utils/order";

const StatusCircle = ({ status }: { status: Order["ordered"] }) => {
  const className =
    "border border-black/60 rounded-xl w-5 h-5 mx-auto " + STATUS_COLOR[status];
  return <div className={className} title={STATUS_LABEL[status]} />;
};

export const OrdersTable = ({ items }: { items: Order[] }) => {
  const router = useRouter();
  return (
    <table className="flex-1 text-sm">
      <thead>
        <tr className="sticky top-0 bg-white z-10 shadow-b shadow-black">
          <th className="text-left pl-2">Date</th>
          <th className="text-left pl-1">Nom</th>
          <th className="text-left pl-1">Article</th>
          <th className="text-left pl-1">Distributeur</th>
          <th className="text-center">État</th>
          <th className="text-center">Prévenu⋅e</th>
          <th className="text-center px-1">Payé</th>
        </tr>
      </thead>
      <tbody className="leading-7">
        {items.map((item, i) => (
          <tr
            key={i}
            className="cursor-pointer even:bg-gray-light"
            onClick={() => router.push(`/order/${item._id}`)}
          >
            <td className="pl-2 py-1" title={item.comment}>
              {formatDateFR(item.date)}
            </td>
            <td className="p-1">{item.customer.fullname}</td>
            <td className="p-1">
              <div className="leading-4">{item.itemTitle}</div>
              <div className="italic">{item.item?.isbn}</div>
            </td>
            <td className="p-1">{item.item?.distributor}</td>
            <td className="p-1">
              <StatusCircle status={item.ordered} />
            </td>
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
