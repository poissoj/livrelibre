import { useRouter } from "next/router";
import React from "react";

import { formatDateFR } from "@/utils/date";
import { type Order, STATUS_LABEL } from "@/utils/order";

const formatBool = (bool: boolean) => (bool ? "Oui" : "Non");

export const OrdersTable = ({ items }: { items: Order[] }) => {
  const router = useRouter();
  return (
    <table className="flex-1">
      <thead>
        <tr className="sticky top-0 bg-white z-10">
          <th className="text-left">Nom</th>
          <th className="text-left">Titre</th>
          <th className="text-left">ISBN</th>
          <th className="text-left">Distributeur</th>
          <th className="text-left">Date</th>
          <th className="text-left">État</th>
          <th className="text-left">Client prévenu</th>
          <th className="text-left">Payé</th>
          <th className="text-left">Commentaire</th>
        </tr>
      </thead>
      <tbody className="leading-7">
        {items.map((item, i) => (
          <tr
            key={i}
            className="cursor-pointer hover:bg-gray-light"
            onClick={() => router.push(`/order/${item._id}`)}
          >
            <td>{item.customer.fullname}</td>
            <td>{item.itemTitle}</td>
            <td>{item.item?.isbn}</td>
            <td>{item.item?.distributor}</td>
            <td>{formatDateFR(item.date)}</td>
            <td>{STATUS_LABEL[item.ordered]}</td>
            <td>{formatBool(item.customerNotified)}</td>
            <td>{formatBool(item.paid)}</td>
            <td>{item.comment}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
