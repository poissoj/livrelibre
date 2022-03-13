import { createSSGHelpers } from "@trpc/react/ssg";
import type { GetStaticPropsResult } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import ContentLoader from "react-content-loader";
import type { DehydratedState } from "react-query";
import tw from "twin.macro";

import { Card, CardBody, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Restricted } from "@/components/Restricted";
import { Title } from "@/components/Title";
import { appRouter } from "@/pages/api/trpc/[trpc]";
import { createContext } from "@/server/context";
import type { Sale } from "@/server/sales";
import { formatNumber, formatPrice } from "@/utils/format";
import { trpc } from "@/utils/trpc";

const StickyTh = tw.th`sticky top-0 bg-white`;

const SkeletonRow = ({ n }: { n: number }) => (
  <>
    <rect x="5%" y={n * 30 + 15} rx="2" ry="2" width="15%" height="10" />
    <rect x="23%" y={n * 30 + 15} rx="2" ry="2" width="15%" height="10" />
    <rect x="41%" y={n * 30 + 15} rx="2" ry="2" width="15%" height="10" />
    <rect x="59%" y={n * 30 + 15} rx="2" ry="2" width="15%" height="10" />
    <rect x="77%" y={n * 30 + 16} rx="2" ry="2" width="15%" height="12" />
  </>
);

const SalesSkeleton = (): JSX.Element => (
  <ContentLoader height={380} width="100%">
    {Array(12)
      .fill(0)
      .map((_, i) => (
        <SkeletonRow key={i} n={i} />
      ))}
  </ContentLoader>
);

const SalesLoader = (): JSX.Element | null => {
  const result = trpc.useQuery(["sales"]);
  if (result.status === "error") {
    return <ErrorMessage />;
  }
  if (result.status === "loading") {
    return <SalesSkeleton />;
  }
  if (result.status === "idle") {
    return null;
  }
  return <SalesTable sales={result.data} />;
};

const makeSaleURL = (sale: Sale) =>
  `/sale/${sale.month.split("/").reverse().join("/")}`;

const SalesTable = ({ sales }: { sales: Sale[] }): JSX.Element => {
  const router = useRouter();
  return (
    <table tw="flex-1">
      <thead>
        <tr>
          <StickyTh tw="text-left pl-2">Mois</StickyTh>
          <StickyTh tw="text-right">Nombre de ventes</StickyTh>
          <StickyTh tw="text-right">Recette totale HT</StickyTh>
          <StickyTh tw="text-right">Recette totale TTC</StickyTh>
          <StickyTh tw="text-right pr-1">Panier moyen</StickyTh>
        </tr>
      </thead>
      <tbody tw="line-height[2.3rem]">
        {sales.map((sale, i) => (
          <tr
            key={i}
            tw="cursor-pointer hover:bg-gray-light"
            onClick={() => router.push({ pathname: makeSaleURL(sale) })}
          >
            <td tw="pl-2">
              <Link href={makeSaleURL(sale)}>{sale.month}</Link>
            </td>
            <td tw="text-right font-number">{formatNumber(sale.count)}</td>
            <td tw="text-right font-number">
              {sale.ht ? formatPrice(sale.ht) : "Inconnu"}
            </td>
            <td tw="text-right font-number">{formatPrice(sale.amount)}</td>
            <td tw="text-right font-number pr-2">
              {sale.avg ? `${formatPrice(sale.avg)}` : "Inconnu"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const Sales = (): JSX.Element => (
  <Restricted role="admin">
    <div tw="margin-left[10%] margin-right[10%] flex-1">
      <Title>Liste des ventes par mois</Title>
      <Card tw="mb-lg max-h-full overflow-hidden flex flex-col">
        <CardTitle>Liste des ventes par mois</CardTitle>
        <CardBody>
          <SalesLoader />
        </CardBody>
      </Card>
    </div>
  </Restricted>
);

export default Sales;

export const getStaticProps = async (): Promise<
  GetStaticPropsResult<{ trpcState: DehydratedState }>
> => {
  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: await createContext(),
  });
  await ssg.fetchQuery("sales");
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 10,
  };
};
