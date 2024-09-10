import { useRouter } from "next/router";
import React from "react";

import type { CustomerWithTotal } from "@/utils/customer";
import { formatPrice } from "@/utils/format";

export const CustomersTable = ({ items }: { items: CustomerWithTotal[] }) => {
  const router = useRouter();
  return (
    <table className="flex-1">
      <thead>
        <tr className="sticky top-0 bg-white z-10">
          <th className="text-left">Nom</th>
          <th className="text-left">Téléphone</th>
          <th className="text-left">Mail</th>
          <th className="text-left">Remarque contact</th>
          <th className="text-left">Commentaire</th>
          <th className="text-right">Remise</th>
          <th className="text-right">Total</th>
        </tr>
      </thead>
      <tbody className="leading-7">
        {items.map((item) => (
          <tr
            key={item.id}
            className="cursor-pointer hover:bg-gray-light"
            onClick={() => router.push(`/customer/${item.id}`)}
          >
            <td>{item.fullname}</td>
            <td>{item.phone}</td>
            <td>{item.email}</td>
            <td>{item.contact}</td>
            <td>{item.comment}</td>
            <td className="text-right font-number pr-2">
              {formatPrice(Math.round(Number(item.total) * 3) / 100)}
            </td>
            <td className="text-right font-number pr-2">
              {formatPrice(Number(item.total))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
