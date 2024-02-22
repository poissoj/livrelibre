import Link from "next/link";
import React from "react";

import { formatDate } from "@/utils/date";
import type { DBOrder, Order } from "@/utils/order";

const formatBool = (bool: boolean) => (bool ? "Oui" : "Non");

const STATUS_LABEL: Record<DBOrder["ordered"], string> = {
  new: "Nouveau",
  ordered: "Commandé",
  received: "Reçu",
  unavailable: "Indisponible",
};

export const OrdersTable = ({ items }: { items: Order[] }) => {
  return (
    <table className="flex-1">
      <thead>
        <tr className="sticky top-0 bg-white z-10">
          <th className="text-left">Nom</th>
          <th className="text-left">ISBN</th>
          <th className="text-left">Date</th>
          <th className="text-left">État</th>
          <th className="text-left">Client prévenu</th>
          <th className="text-left">Payé</th>
          <th className="text-left">Commentaire</th>
        </tr>
      </thead>
      <tbody className="leading-7">
        {items.map((item, i) => (
          <tr key={i} className="hover:bg-gray-light">
            <td>
              <Link href={`/customer/${item.customer._id}`}>
                {item.customer.fullname}
              </Link>
            </td>
            <td>{item.isbn}</td>
            <td>{formatDate(item.date)}</td>
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
