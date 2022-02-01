import tw from "twin.macro";
import Link from "next/link";
import type { Item } from "@/utils/item";
import React from "react";
import { AddToCartButton } from "./AddToCartButton";

const StickyTh = tw.th`sticky top-0 bg-white`;

export const ItemsTable = ({ items }: { items: Item[] }) => (
  <table tw="flex-1 border-separate border-spacing[2px 0.5rem]">
    <thead>
      <tr>
        <StickyTh tw="text-left">Distributeur</StickyTh>
        <StickyTh tw="text-left">Titre</StickyTh>
        <StickyTh tw="text-left">Auteur</StickyTh>
        <StickyTh tw="text-right">Quantité</StickyTh>
        <StickyTh> </StickyTh>
      </tr>
    </thead>
    <tbody>
      {items.map((item, i) => (
        <tr key={i}>
          <td>{item.distributor}</td>
          <td>
            <span tw="text-primary-darkest">
              <Link href={`/item/${item._id.toString()}`}>{item.title}</Link>
            </span>
          </td>
          <td>{item.author}</td>
          <td tw="text-right font-mono pr-2">{item.amount}</td>
          <td tw="text-primary-darker">
            <AddToCartButton
              item={{ ...item, _id: item._id.toString() }}
              tw="px-3"
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
