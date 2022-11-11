import Link from "next/link";
import React from "react";
import "twin.macro";

import { formatNumber } from "@/utils/format";
import type { Item } from "@/utils/item";

import { AddToCartButton } from "./AddToCartButton";

export const ItemsTable = ({ items }: { items: Item[] }) => (
  <table tw="flex-1 border-separate [border-spacing:2px 0.5rem]">
    <thead>
      <tr tw="sticky top-0 bg-white z-10">
        <th tw="text-left">Distributeur</th>
        <th tw="text-left">Titre</th>
        <th tw="text-left">Auteur</th>
        <th tw="text-right">Quantité</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {items.map((item, i) => (
        <tr key={i}>
          <td>{item.distributor}</td>
          <td>
            <span tw="text-primary-darkest">
              <Link href={`/item/${item._id}`} legacyBehavior>
                {item.title}
              </Link>
            </span>
          </td>
          <td>{item.author}</td>
          <td tw="text-right font-number pr-2">{formatNumber(item.amount)}</td>
          <td tw="text-primary-darker">
            <AddToCartButton item={item} tw="px-3" />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
