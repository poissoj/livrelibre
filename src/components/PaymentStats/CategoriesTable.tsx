import { clsx } from "clsx";

import { formatNumber, formatPrice } from "@/utils/format";

type TCategories = { type: string; nb: number; totalPrice: string }[];

const COMMON_TH_STYLES = "sticky top-0 bg-white";

export const CategoriesTable = ({
  categories,
}: {
  categories: TCategories;
}) => (
  <table className="flex-1">
    <thead>
      <tr>
        <th className={clsx(COMMON_TH_STYLES, "text-left")}>Catégorie</th>
        <th className={clsx(COMMON_TH_STYLES, "text-right")}>Quantité</th>
        <th className={clsx(COMMON_TH_STYLES, "text-right")}>Total</th>
      </tr>
    </thead>
    <tbody className="[line-height:1.9rem]">
      {categories.map((category, i) => (
        <tr key={i}>
          <td>{category.type}</td>
          <td className="text-right font-number">
            {formatNumber(category.nb)}
          </td>
          <td className="text-right font-number">
            {formatPrice(Number(category.totalPrice))}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
