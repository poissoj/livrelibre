import tw from "twin.macro";

import { formatNumber, formatPrice, formatTVA } from "@/utils/format";
import type { RouterOutput } from "@/utils/trpc";

export const StickyTh = tw.th`sticky top-0 bg-white`;

type TStats = RouterOutput["salesByMonth"]["stats"];

export const StatsByTVA = ({ stats }: { stats: TStats }) => {
  return (
    <table tw="flex-1">
      <thead>
        <tr>
          <StickyTh tw="text-left">Type de paiement</StickyTh>
          <StickyTh tw="text-right">TVA</StickyTh>
          <StickyTh tw="text-right">Quantité</StickyTh>
          <StickyTh tw="text-right">Total</StickyTh>
        </tr>
      </thead>
      <tbody tw="[line-height:1.9rem]">
        {stats.map((stat, i) => (
          <tr key={i}>
            <td>{stat.type}</td>
            <td tw="text-right font-number">{formatTVA(stat.tva)}</td>
            <td tw="text-right font-number">{formatNumber(stat.nb)}</td>
            <td tw="text-right font-number">
              {formatPrice(Number(stat.totalPrice))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
