import tw from "twin.macro";

import { formatNumber, formatPrice } from "@/utils/format";

type TCategories = { type: string; nb: number; totalPrice: string }[];

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
    <tbody tw="[line-height:1.9rem]">
      {categories.map((category, i) => (
        <tr key={i}>
          <td>{category.type}</td>
          <td tw="text-right font-number">{formatNumber(category.nb)}</td>
          <td tw="text-right font-number">
            {formatPrice(Number(category.totalPrice))}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
