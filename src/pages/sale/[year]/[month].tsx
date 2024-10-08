import { clsx } from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactElement } from "react";
import ContentLoader from "react-content-loader";

import { Card, CardBody, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { CategoriesTable } from "@/components/PaymentStats/CategoriesTable";
import { CategorySkeleton } from "@/components/PaymentStats/CategorySkeleton";
import { Restricted } from "@/components/Restricted";
import { StatsByTVA } from "@/components/TVAStats/StatsByTVA";
import { TVASkeleton } from "@/components/TVAStats/TVASkeleton";
import { Title } from "@/components/Title";
import { formatPrice } from "@/utils/format";
import { ITEM_TYPES } from "@/utils/item";
import { type RouterOutput, trpc } from "@/utils/trpc";

const TH_STYLES = "sticky top-0 bg-white";

type TSalesByDay = RouterOutput["salesByMonth"]["salesByDay"];

const formatDate = (date: string) => date.split("-").reverse().join("/");
const makeSaleURL = (date: string) => `/sale/${date.split("-").join("/")}`;

const SalesTable = ({ sales }: { sales: TSalesByDay }) => {
  const router = useRouter();
  return (
    <table className="flex-1">
      <thead>
        <tr>
          <th className={clsx(TH_STYLES, "text-left pl-2")}>Jour</th>
          <th className={clsx(TH_STYLES, "text-right")}>Nombre de ventes</th>
          <th className={clsx(TH_STYLES, "text-right")}>Recette totale</th>
        </tr>
      </thead>
      <tbody className="[line-height:2.3rem]">
        {sales.map((sale, i) => (
          <tr
            key={i}
            className="cursor-pointer hover:bg-gray-light"
            onClick={() => router.push({ pathname: makeSaleURL(sale.date) })}
          >
            <td className="pl-2">
              <Link href={makeSaleURL(sale.date)}>{formatDate(sale.date)}</Link>
            </td>
            <td className="text-right font-number">{sale.count}</td>
            <td className="text-right font-number pr-2">
              {formatPrice(Number(sale.total))}
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

const SalesSkeleton = (): ReactElement => (
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
  const result = trpc.salesByMonth.useQuery(props);
  if (result.isError) {
    return <ErrorMessage />;
  }
  if (result.isLoading) {
    return <SalesSkeleton />;
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
    Number(month) - 1,
  ).toLocaleDateString("fr", { month: "long", year: "numeric" });
  const title = `Liste des ventes - ${monthLabel}`;
  return (
    <Card className="flex flex-col flex-1 max-h-full overflow-hidden">
      <CardTitle>{title}</CardTitle>
      <CardBody>
        <SalesLoader month={month} year={year} />
      </CardBody>
    </Card>
  );
};

const TVALoader = (props: MonthProps) => {
  const result = trpc.salesByMonth.useQuery(props);
  if (result.isError) {
    return <ErrorMessage />;
  }
  if (result.isLoading) {
    return <TVASkeleton />;
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
    <Card className="[min-height:12rem] flex flex-col">
      <CardTitle>Répartition par TVA</CardTitle>
      <CardBody>
        <TVALoader month={month} year={year} />
      </CardBody>
    </Card>
  );
};

const CategoriesLoader = (props: MonthProps) => {
  const result = trpc.salesByMonth.useQuery(props);
  if (result.isError) {
    return <ErrorMessage />;
  }
  if (result.isLoading) {
    return <CategorySkeleton />;
  }
  const categories = result.data.itemTypes.map((it) => ({
    ...it,
    label: ITEM_TYPES[it.itemType],
  }));
  return <CategoriesTable categories={categories} />;
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

const SalesByMonth = (): ReactElement => {
  return (
    <Restricted role="admin">
      <div className="flex items-start gap-lg flex-1 flex-wrap">
        <Title>Voir un article</Title>
        <SalesCard />
        <div className="flex flex-col gap-lg flex-1 max-h-full">
          <TVACard />
          <CategoriesCard />
        </div>
      </div>
    </Restricted>
  );
};

export default SalesByMonth;
