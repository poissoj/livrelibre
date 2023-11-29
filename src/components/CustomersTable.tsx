import { useRouter } from "next/router";
import React from "react";

import { Customer } from "@/utils/customer";
import { formatPrice } from "@/utils/format";

export const CustomersTable = ({ items }: { items: Customer[] }) => {
  const router = useRouter();
  return (
    <table className="flex-1">
      <thead>
        <tr className="sticky top-0 bg-white z-10">
          <th className="text-left">Nom</th>
          <th className="text-left">Prénom</th>
          <th className="text-left">Contact</th>
          <th className="text-left">Commentaire</th>
          <th className="text-right">Remise</th>
          <th className="text-right">Total</th>
        </tr>
      </thead>
      <tbody className="leading-7">
        {items.map((item, i) => (
          <tr
            key={i}
            className="cursor-pointer hover:bg-gray-light"
            onClick={() => router.push(`/customer/${item._id}`)}
          >
            <td>{item.lastname}</td>
            <td>{item.firstname}</td>
            <td>{item.contact}</td>
            <td>{item.comment}</td>
            <td className="text-right font-number pr-2">
              {formatPrice(Math.round(item.total * 3) / 100)}
            </td>
            <td className="text-right font-number pr-2">
              {formatPrice(item.total)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
