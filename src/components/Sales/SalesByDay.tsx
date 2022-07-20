import { useRef } from "react";
import tw from "twin.macro";

import { Card, CardBody, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { CategoriesTable } from "@/components/PaymentStats/CategoriesTable";
import { CategorySkeleton } from "@/components/PaymentStats/CategorySkeleton";
import { StatsByTVA } from "@/components/TVAStats/StatsByTVA";
import { TVASkeleton } from "@/components/TVAStats/TVASkeleton";
import { Title } from "@/components/Title";
import { formatPrice } from "@/utils/format";
import { useScrollRestoration } from "@/utils/scroll";
import { trpc } from "@/utils/trpc";

import { SalesSkeleton } from "./SalesSkeleton";
import { SalesTable } from "./SalesTable";

const TVALoader = ({ date }: { date: string }) => {
  const result = trpc.useQuery(["salesByDay", date]);
  if (result.isError) {
    return <ErrorMessage />;
  }
  if (result.isLoading) {
    return <TVASkeleton />;
  }
  if (result.isIdle) {
    return null;
  }
  return <StatsByTVA stats={result.data.tva} />;
};

const CategoriesLoader = ({ date }: { date: string }) => {
  const result = trpc.useQuery(["salesByDay", date]);
  if (result.isError) {
    return <ErrorMessage />;
  }
  if (result.isLoading) {
    return <CategorySkeleton />;
  }
  if (result.isIdle) {
    return null;
  }
  return (
    <div tw="flex flex-1 flex-col gap-3">
      <CategoriesTable categories={result.data.paymentMethods} />
      <p tw="self-end">
        <strong>Total&nbsp;: </strong>
        <span tw="font-number">{formatPrice(result.data.total)}</span>
      </p>
    </div>
  );
};

const SalesLoader = ({ date }: { date: string }) => {
  const result = trpc.useQuery(["salesByDay", date]);
  if (result.isError) {
    return <ErrorMessage />;
  }
  if (result.isLoading) {
    return (
      <Card tw="flex flex-col">
        <CardTitle>{`Ventes du ${date}`}</CardTitle>
        <CardBody>
          <SalesSkeleton />
        </CardBody>
      </Card>
    );
  }
  if (result.isIdle) {
    return null;
  }
  return (
    <Card tw="flex flex-col">
      <CardTitle>{`Ventes du ${date} (${result.data.salesCount})`}</CardTitle>
      <CardBody>
        <SalesTable carts={result.data.carts} />
      </CardBody>
    </Card>
  );
};

// padding is needed for shadow to be visible despite the overflow-auto
const Wrapper = tw.div`flex flex-1 flex-col gap-lg max-h-full overflow-auto pr-1 pb-1 -mr-1 -mb-1`;

export const SalesByDay = ({ date }: { date: string }): JSX.Element | null => {
  const ref = useRef<HTMLDivElement>(null);
  useScrollRestoration(ref);

  const title = `Liste des ventes du ${date}`;
  return (
    <Wrapper ref={ref}>
      <Title>{title}</Title>
      <div tw="flex gap-lg items-start flex-wrap">
        <Card tw="flex-1">
          <CardTitle>Répartition par TVA</CardTitle>
          <CardBody>
            <TVALoader date={date} />
          </CardBody>
        </Card>
        <Card tw="flex-1">
          <CardTitle>Répartition par type de paiement</CardTitle>
          <CardBody>
            <CategoriesLoader date={date} />
          </CardBody>
        </Card>
      </div>
      <SalesLoader date={date} />
    </Wrapper>
  );
};
