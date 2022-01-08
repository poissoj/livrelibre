import type { InferQueryOutput } from "@/utils/trpc";
import tw from "twin.macro";

export const StickyTh = tw.th`sticky top-0 bg-white`;

type TStats = InferQueryOutput<"salesByMonth">["stats"];
const formatTVA = (tva: string) => (tva === "Inconnu" ? tva : `${tva}%`);

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
      <tbody tw="line-height[1.9rem]">
        {stats.map((stat, i) => (
          <tr key={i}>
            <td>{stat[1]}</td>
            <td tw="text-right font-mono">{formatTVA(stat[0])}</td>
            <td tw="text-right font-mono">{stat[2]}</td>
            <td tw="text-right font-mono">{stat[3]}€</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};