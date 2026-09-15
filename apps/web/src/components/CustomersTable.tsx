import React from "react";
import { useNavigate } from "react-router";

import type { CustomerWithTotal } from "@livrelibre/shared/customer";
import { formatPrice } from "@livrelibre/shared/format";

export const CustomersTable = ({ items }: { items: CustomerWithTotal[] }) => {
  const navigate = useNavigate();
  return (
    <table className="flex-1">
      <thead>
        <tr className="sticky top-0 bg-white z-10">
          <th className="text-left">Nom</th>
          <th className="text-left w-32">Téléphone</th>
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
            onClick={() => navigate(`/customer/${item.id}`)}
          >
            <td>{item.fullname}</td>
            <td className="whitespace-nowrap">{item.phone}</td>
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
