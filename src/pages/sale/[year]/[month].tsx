import { createSSGHelpers } from "@trpc/react/ssg";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import ContentLoader from "react-content-loader";
import type { DehydratedState } from "react-query";
import tw from "twin.macro";

import { Card, CardBody, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { CategoriesTable } from "@/components/PaymentStats/CategoriesTable";
import { CategorySkeleton } from "@/components/PaymentStats/CategorySkeleton";
import { Restricted } from "@/components/Restricted";
import { StatsByTVA } from "@/components/TVAStats/StatsByTVA";
import { TVASkeleton } from "@/components/TVAStats/TVASkeleton";
import { Title } from "@/components/Title";
import { appRouter } from "@/pages/api/trpc/[trpc]";
import { createContext } from "@/server/context";
import { formatPrice } from "@/utils/format";
import { InferQueryOutput, trpc } from "@/utils/trpc";

const StickyTh = tw.th`sticky top-0 bg-white`;

type TSalesByDay = InferQueryOutput<"salesByMonth">["salesByDay"];

const makeSaleURL = (date: string) =>
  `/sale/${date.split("/").reverse().join("/")}`;

const SalesTable = ({ sales }: { sales: TSalesByDay }) => {
  const router = useRouter();
  return (
    <table tw="flex-1">
      <thead>
        <tr>
          <StickyTh tw="text-left pl-2">Jour</StickyTh>
          <StickyTh tw="text-right">Nombre de ventes</StickyTh>
          <StickyTh tw="text-right">Recette totale</StickyTh>
        </tr>
      </thead>
      <tbody tw="line-height[2.3rem]">
        {sales.map((sale, i) => (
          <tr
            key={i}
            tw="cursor-pointer hover:bg-gray-light"
            onClick={() => router.push({ pathname: makeSaleURL(sale.date) })}
          >
            <td tw="pl-2">
              <Link href={makeSaleURL(sale.date)} legacyBehavior>
                {sale.date}
              </Link>
            </td>
            <td tw="text-right font-number">{sale.count}</td>
            <td tw="text-right font-number pr-2">
              {formatPrice(Number(sale.amount))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const SalesSkeletonRow = ({ n }: { n: number }) => (
  <>
    <rect x="5%" y={n * 30 + 15} rx="2" ry="2" width="19%" height="10" />
    <rect x="27%" y={n * 30 + 15} rx="2" ry="2" width="19%" height="10" />
    <rect x="49%" y={n * 30 + 15} rx="2" ry="2" width="19%" height="10" />
    <rect x="71%" y={n * 30 + 13} rx="2" ry="2" width="19%" height="14" />
  </>
);

const SalesSkeleton = (): JSX.Element => (
  <ContentLoader height={600} width="100%">
    {Array(20)
      .fill(0)
      .map((_, i) => (
        <SalesSkeletonRow key={i} n={i} />
      ))}
  </ContentLoader>
);

type MonthProps = {
  month: string;
  year: string;
};

const SalesLoader = (props: MonthProps) => {
  const result = trpc.useQuery(["salesByMonth", props]);
  if (result.isError) {
    return <ErrorMessage />;
  }
  if (result.isLoading) {
    return <SalesSkeleton />;
  }
  if (result.isIdle) {
    return null;
  }
  return <SalesTable sales={result.data.salesByDay} />;
};

const SalesCard = () => {
  const router = useRouter();
  const { year, month } = router.query;
  if (typeof month !== "string" || typeof year !== "string") {
    return null;
  }
  const monthLabel = new Date(
    Number(year),
    Number(month) - 1
  ).toLocaleDateString("fr", { month: "long", year: "numeric" });
  const title = `Liste des ventes - ${monthLabel}`;
  return (
    <Card tw="flex flex-col flex-1 max-h-full overflow-hidden">
      <CardTitle>{title}</CardTitle>
      <CardBody>
        <SalesLoader month={month} year={year} />
      </CardBody>
    </Card>
  );
};

const TVALoader = (props: MonthProps) => {
  const result = trpc.useQuery(["salesByMonth", props]);
  if (result.isError) {
    return <ErrorMessage />;
  }
  if (result.isLoading) {
    return <TVASkeleton />;
  }
  if (result.isIdle) {
    return null;
  }
  return <StatsByTVA stats={result.data.stats} />;
};

const TVACard = () => {
  const router = useRouter();
  const { year, month } = router.query;
  if (typeof month !== "string" || typeof year !== "string") {
    return null;
  }
  return (
    <Card tw="min-height[12rem] flex flex-col">
      <CardTitle>Répartition par TVA</CardTitle>
      <CardBody>
        <TVALoader month={month} year={year} />
      </CardBody>
    </Card>
  );
};

const CategoriesLoader = (props: MonthProps) => {
  const result = trpc.useQuery(["salesByMonth", props]);
  if (result.isError) {
    return <ErrorMessage />;
  }
  if (result.isLoading) {
    return <CategorySkeleton />;
  }
  if (result.isIdle) {
    return null;
  }
  return <CategoriesTable categories={result.data.itemTypes} />;
};

const CategoriesCard = () => {
  const router = useRouter();
  const { year, month } = router.query;
  if (typeof month !== "string" || typeof year !== "string") {
    return null;
  }
  return (
    <Card>
      <CardTitle>Répartition par catégorie</CardTitle>
      <CardBody>
        <CategoriesLoader month={month} year={year} />
      </CardBody>
    </Card>
  );
};

const SalesByMonth = (): JSX.Element => {
  return (
    <Restricted role="admin">
      <div tw="flex items-start gap-lg flex-1 flex-wrap">
        <Title>Voir un article</Title>
        <SalesCard />
        <div tw="flex flex-col gap-lg flex-1 max-h-full">
          <TVACard />
          <CategoriesCard />
        </div>
      </div>
    </Restricted>
  );
};

export default SalesByMonth;

export const getServerSideProps: GetServerSideProps<{
  trpcState: DehydratedState;
}> = async (context) => {
  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: await createContext(),
  });
  const year = context.params?.year;
  const month = context.params?.month;
  if (typeof year === "string" && typeof month === "string") {
    await ssg.fetchQuery("salesByMonth", { month, year });
  }
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};
