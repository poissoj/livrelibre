import dynamic from "next/dynamic";
import type { ReactElement } from "react";
import ContentLoader from "react-content-loader";

import { Card, CardBody, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Title } from "@/components/Title";
import { trpc } from "@/utils/trpc";

const DAYS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

const SalesByHourSkeleton = () => (
  <ContentLoader
    viewBox="0 0 900 320"
    width={900}
    height={320}
    uniqueKey="sales-by-hour-sk"
  >
    <rect x={84} y={257} width={53} height={33} />
    <rect x={151} y={137} width={53} height={153} />
    <rect x={218} y={3} width={53} height={287} />
    <rect x={286} y={60} width={53} height={230} />
    <rect x={353} y={251} width={53} height={39} />
    <rect x={420} y={201} width={53} height={89} />
    <rect x={488} y={131} width={53} height={159} />
    <rect x={555} y={104} width={53} height={186} />
    <rect x={622} y={115} width={53} height={175} />
    <rect x={690} y={150} width={53} height={140} />
    <rect x={757} y={256} width={53} height={34} />
  </ContentLoader>
);

const SalesByDaySkeleton = () => (
  <ContentLoader
    viewBox="0 0 800 300"
    width={800}
    height={300}
    uniqueKey="sales-by-day-sk"
  >
    <rect x={16} y={11} width={90} height={254} />
    <rect x={129} y={217} width={90} height={48} />
    <rect x={242} y={121} width={90} height={144} />
    <rect x={355} y={118} width={90} height={147} />
    <rect x={468} y={124} width={90} height={141} />
    <rect x={581} y={101} width={90} height={164} />
    <rect x={693} y={81} width={90} height={184} />
  </ContentLoader>
);

const SalesByHour = dynamic(() => import("@/components/Charts/SalesByHour"), {
  loading: SalesByHourSkeleton,
});
const SalesByDay = dynamic(() => import("@/components/Charts/SalesByDay"), {
  loading: SalesByHourSkeleton,
});

const Spacer = () => <div className="w-1 h-1 flex-shrink-0" />;

const StatsLoader = () => {
  const result = trpc.stats.useQuery();
  let hourSales: ReactElement | null = null;
  let daySales: ReactElement | null = null;
  if (result.status === "error") {
    hourSales = <ErrorMessage />;
    daySales = hourSales;
  }
  if (result.status === "loading") {
    hourSales = <SalesByHourSkeleton />;
    daySales = <SalesByDaySkeleton />;
  }
  if (result.status === "success") {
    const days = result.data.days.map(({ day, count }) => ({
      name: DAYS[day],
      count,
    }));
    hourSales = <SalesByHour hours={result.data.hours} />;
    daySales = <SalesByDay days={days} />;
  }
  return (
    <>
      <Card>
        <CardTitle>Nombre de ventes par heure</CardTitle>
        <CardBody>{hourSales}</CardBody>
      </Card>
      <Card>
        <CardTitle>Nombre de ventes par jour</CardTitle>
        <CardBody className="[width:900px] justify-center">{daySales}</CardBody>
      </Card>
      <Spacer />
    </>
  );
};

const Stats = (): ReactElement => (
  <div className="flex flex-1 flex-col gap-lg items-center">
    <Title>Statistiques</Title>
    <StatsLoader />
  </div>
);

export default Stats;
