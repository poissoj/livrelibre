import Link from "next/link";
import React from "react";

import { formatNumber } from "@/utils/format";
import type { Item } from "@/utils/item";

import { AddToCartButton } from "./AddToCartButton";

export const ItemsTable = ({ items }: { items: Item[] }) => (
  <table className="flex-1 border-separate [border-spacing:2px 0.5rem]">
    <thead>
      <tr className="sticky top-0 bg-white z-10">
        <th className="text-left">Distributeur</th>
        <th className="text-left">Titre</th>
        <th className="text-left">Auteur·ice</th>
        <th className="text-right">Quantité</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {items.map((item, i) => (
        <tr key={i}>
          <td>{item.distributor}</td>
          <td>
            <span className="text-primary-darkest">
              <Link href={`/item/${item.id}`}>{item.title}</Link>
            </span>
          </td>
          <td>{item.author}</td>
          <td className="text-right font-number pr-2">
            {formatNumber(item.amount)}
          </td>
          <td className="text-primary-darker">
            <AddToCartButton item={item} className="px-3" />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
