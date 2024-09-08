import { clsx } from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactElement } from "react";
import ContentLoader from "react-content-loader";

import { Card, CardBody, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Restricted } from "@/components/Restricted";
import { Title } from "@/components/Title";
import type { Sale } from "@/server/sales";
import { formatNumber, formatPrice } from "@/utils/format";
import { trpc } from "@/utils/trpc";

const TH_STYLES = "sticky top-0 bg-white";

const SkeletonRow = ({ n }: { n: number }) => (
  <>
    <rect x="5%" y={n * 30 + 15} rx="2" ry="2" width="15%" height="10" />
    <rect x="23%" y={n * 30 + 15} rx="2" ry="2" width="15%" height="10" />
    <rect x="41%" y={n * 30 + 15} rx="2" ry="2" width="15%" height="10" />
    <rect x="59%" y={n * 30 + 15} rx="2" ry="2" width="15%" height="10" />
    <rect x="77%" y={n * 30 + 16} rx="2" ry="2" width="15%" height="12" />
  </>
);

const SalesSkeleton = (): ReactElement => (
  <ContentLoader height={380} width="100%">
    {Array(12)
      .fill(0)
      .map((_, i) => (
        <SkeletonRow key={i} n={i} />
      ))}
  </ContentLoader>
);

const SalesLoader = (): ReactElement | null => {
  const result = trpc.sales.useQuery();
  if (result.status === "error") {
    return <ErrorMessage />;
  }
  if (result.status === "loading") {
    return <SalesSkeleton />;
  }
  return <SalesTable sales={result.data} />;
};

const makeSaleURL = (sale: Sale) =>
  `/sale/${sale.month.split("/").reverse().join("/")}`;

const SalesTable = ({ sales }: { sales: Sale[] }): ReactElement => {
  const router = useRouter();
  return (
    <table className="flex-1">
      <thead>
        <tr>
          <th className={clsx(TH_STYLES, "text-left pl-2")}>Mois</th>
          <th className={clsx(TH_STYLES, "text-right")}>Nombre de ventes</th>
          <th className={clsx(TH_STYLES, "text-right")}>Recette totale HT</th>
          <th className={clsx(TH_STYLES, "text-right")}>Recette totale TTC</th>
          <th className={clsx(TH_STYLES, "text-right pr-1")}>Panier moyen</th>
        </tr>
      </thead>
      <tbody className="[line-height:2.3rem]">
        {sales.map((sale, i) => (
          <tr
            key={i}
            className="cursor-pointer hover:bg-gray-light"
            onClick={() => router.push({ pathname: makeSaleURL(sale) })}
          >
            <td className="pl-2">
              <Link href={makeSaleURL(sale)}>{sale.month}</Link>
            </td>
            <td className="text-right font-number">
              {formatNumber(sale.count)}
            </td>
            <td className="text-right font-number">
              {sale.ht ? formatPrice(sale.ht) : "Inconnu"}
            </td>
            <td className="text-right font-number">
              {formatPrice(sale.amount)}
            </td>
            <td className="text-right font-number pr-2">
              {sale.avg ? formatPrice(sale.avg) : "Inconnu"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const Sales = (): ReactElement => (
  <Restricted role="admin">
    <div className="[margin-left:10%] [margin-right:10%] flex-1">
      <Title>Liste des ventes par mois</Title>
      <Card className="mb-lg max-h-full overflow-hidden flex flex-col">
        <CardTitle>Liste des ventes par mois</CardTitle>
        <CardBody>
          <SalesLoader />
        </CardBody>
      </Card>
    </div>
  </Restricted>
);

export default Sales;
