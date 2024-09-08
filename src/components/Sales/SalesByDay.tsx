import { type ReactElement, useRef } from "react";

import { Card, CardBody, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { CategoriesTable } from "@/components/PaymentStats/CategoriesTable";
import { CategorySkeleton } from "@/components/PaymentStats/CategorySkeleton";
import { StatsByTVA } from "@/components/TVAStats/StatsByTVA";
import { TVASkeleton } from "@/components/TVAStats/TVASkeleton";
import { Title } from "@/components/Title";
import { formatPrice } from "@/utils/format";
import { PAYMENT_METHODS } from "@/utils/sale";
import { useScrollRestoration } from "@/utils/scroll";
import { trpc } from "@/utils/trpc";

import { SalesSkeleton } from "./SalesSkeleton";
import { SalesTable } from "./SalesTable";

const TVALoader = ({ date }: { date: string }) => {
  const result = trpc.salesByDay.useQuery(date);
  if (result.isError) {
    return <ErrorMessage />;
  }
  if (result.isLoading) {
    return <TVASkeleton />;
  }
  return <StatsByTVA stats={result.data.tva} />;
};

const CategoriesLoader = ({ date }: { date: string }) => {
  const result = trpc.salesByDay.useQuery(date);
  if (result.isError) {
    return <ErrorMessage />;
  }
  if (result.isLoading) {
    return <CategorySkeleton />;
  }
  const categories = result.data.paymentMethods.map((m) => ({
    ...m,
    label: m.type === "unknown" ? "Inconnu" : PAYMENT_METHODS[m.type],
  }));
  return (
    <div className="flex flex-1 flex-col gap-3">
      <CategoriesTable categories={categories} />
      <p className="self-end">
        <strong>Total&nbsp;: </strong>
        <span className="font-number">{formatPrice(result.data.total)}</span>
      </p>
    </div>
  );
};

const SalesLoader = ({ date }: { date: string }) => {
  const result = trpc.salesByDay.useQuery(date);
  if (result.isError) {
    return <ErrorMessage />;
  }
  if (result.isLoading) {
    return (
      <Card className="flex flex-col">
        <CardTitle>{`Ventes du ${date}`}</CardTitle>
        <CardBody>
          <SalesSkeleton />
        </CardBody>
      </Card>
    );
  }
  return (
    <Card className="flex flex-col">
      <CardTitle>{`Ventes du ${date} (${result.data.salesCount})`}</CardTitle>
      <CardBody>
        <SalesTable carts={result.data.carts} />
      </CardBody>
    </Card>
  );
};

export const SalesByDay = ({ date }: { date: string }): ReactElement | null => {
  const ref = useRef<HTMLDivElement>(null);
  useScrollRestoration(ref);

  const title = `Liste des ventes du ${date}`;
  return (
    // padding is needed for shadow to be visible despite the overflow-auto
    <div
      ref={ref}
      className="flex flex-1 flex-col gap-lg max-h-full overflow-auto pr-1 pb-1 -mr-1 -mb-1"
    >
      <Title>{title}</Title>
      <div className="flex gap-lg items-start flex-wrap">
        <Card className="flex-1">
          <CardTitle>Répartition par TVA</CardTitle>
          <CardBody>
            <TVALoader date={date} />
          </CardBody>
        </Card>
        <Card className="flex-1">
          <CardTitle>Répartition par type de paiement</CardTitle>
          <CardBody>
            <CategoriesLoader date={date} />
          </CardBody>
        </Card>
      </div>
      <SalesLoader date={date} />
    </div>
  );
};
