import tw from "twin.macro";

import type { InferQueryOutput } from "@/utils/trpc";

type TCategories = InferQueryOutput<"salesByMonth">["itemTypes"];

const StickyTh = tw.th`sticky top-0 bg-white`;

export const CategoriesTable = ({
  categories,
}: {
  categories: TCategories;
}) => (
  <table tw="flex-1">
    <thead>
      <tr>
        <StickyTh tw="text-left">Catégorie</StickyTh>
        <StickyTh tw="text-right">Quantité</StickyTh>
        <StickyTh tw="text-right">Total</StickyTh>
      </tr>
    </thead>
    <tbody tw="line-height[1.9rem]">
      {categories.map((category, i) => (
        <tr key={i}>
          <td>{category.type}</td>
          <td tw="text-right font-mono">{category.nb}</td>
          <td tw="text-right font-mono">{category.totalPrice}€</td>
        </tr>
      ))}
    </tbody>
  </table>
);
