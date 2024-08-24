import { clsx } from "clsx";

import { formatNumber, formatPrice, formatTVA } from "@/utils/format";
import { PAYMENT_METHODS } from "@/utils/sale";
import type { RouterOutput } from "@/utils/trpc";

const TH_STYLES = "sticky top-0 bg-white";
type TStats = RouterOutput["salesByMonth"]["stats"];

const formatPaymentMethod = (method: TStats[number]["paymentType"]) =>
  method ? PAYMENT_METHODS[method] : "";

export const StatsByTVA = ({ stats }: { stats: TStats }) => {
  return (
    <table className="flex-1">
      <thead>
        <tr>
          <th className={clsx(TH_STYLES, "text-left")}>Type de paiement</th>
          <th className={clsx(TH_STYLES, "text-right")}>TVA</th>
          <th className={clsx(TH_STYLES, "text-right")}>Quantité</th>
          <th className={clsx(TH_STYLES, "text-right")}>Total</th>
        </tr>
      </thead>
      <tbody className="[line-height:1.9rem]">
        {stats.map((stat, i) => (
          <tr key={i}>
            <td>{formatPaymentMethod(stat.paymentType)}</td>
            <td className="text-right font-number">{formatTVA(stat.tva)}</td>
            <td className="text-right font-number">{formatNumber(stat.nb)}</td>
            <td className="text-right font-number">
              {formatPrice(Number(stat.total))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
