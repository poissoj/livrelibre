import { clsx } from "clsx";

import { formatNumber, formatPrice } from "@/utils/format";

type Category = { label: string; nb: number; total: string | null };

const COMMON_TH_STYLES = "sticky top-0 bg-white";

export const CategoriesTable = ({ categories }: { categories: Category[] }) => (
  <table className="flex-1">
    <thead>
      <tr>
        <th className={clsx(COMMON_TH_STYLES, "text-left")}>Catégorie</th>
        <th className={clsx(COMMON_TH_STYLES, "text-right")}>Quantité</th>
        <th className={clsx(COMMON_TH_STYLES, "text-right")}>Total</th>
      </tr>
    </thead>
    <tbody className="[line-height:1.9rem]">
      {categories.map((category) => (
        <tr key={category.label}>
          <td>{category.label}</td>
          <td className="text-right font-number">
            {formatNumber(category.nb)}
          </td>
          <td className="text-right font-number">
            {formatPrice(Number(category.total))}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
