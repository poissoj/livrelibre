import tw from "twin.macro";
import Link from "next/link";
import type { Item } from "@/utils/item";
import React from "react";

const StickyTh = tw.th`sticky top-0 bg-white`;

export const ItemsTable = ({ items }: { items: Item[] }) => (
  <table tw="flex-1 border-collapse[separate] border-spacing[2px 0.5rem]">
    <thead>
      <tr>
        <StickyTh>Distributeur</StickyTh>
        <StickyTh>Titre</StickyTh>
        <StickyTh>Auteur</StickyTh>
        <StickyTh>Quantité</StickyTh>
        <StickyTh></StickyTh>
      </tr>
    </thead>
    <tbody>
      {items.map((item, i) => (
        <tr key={i}>
          <td>{item.distributor}</td>
          <td>
            <span tw="text-primary-darkest">
              <Link href={`/item/${item._id}`}>{item.title}</Link>
            </span>
          </td>
          <td>{item.author}</td>
          <td>{item.amount}</td>
          <td></td>
        </tr>
      ))}
    </tbody>
  </table>
);
