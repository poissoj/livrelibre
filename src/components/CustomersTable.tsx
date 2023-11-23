import React from "react";

import { DBCustomer } from "@/utils/customer";
import { formatPrice } from "@/utils/format";

export const CustomersTable = ({ items }: { items: DBCustomer[] }) => (
  <table className="flex-1 border-separate [border-spacing:2px 0.5rem]">
    <thead>
      <tr className="sticky top-0 bg-white z-10">
        <th className="text-left">Nom</th>
        <th className="text-left">Prénom</th>
        <th className="text-left">Contact</th>
        <th className="text-right">Remise</th>
        <th className="text-right">Total</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {items.map((item, i) => (
        <tr key={i}>
          <td>{item.lastname}</td>
          <td>{item.firstname}</td>
          <td>{item.contact}</td>
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
