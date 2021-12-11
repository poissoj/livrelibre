import { Card } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Title } from "@/components/Title";
import { trpc } from "@/utils/trpc";
import { Bar, BarChart, LabelList, XAxis } from "recharts";
import "twin.macro";

const DAYS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

const nf = Intl.NumberFormat();

const SalesByHour = ({
  hours,
}: {
  hours: { hour: number; count: number }[];
}) => (
  <BarChart
    data={hours}
    width={900}
    height={320}
    margin={{ left: 10, right: 15 }}
  >
    <XAxis
      dataKey="hour"
      scale="linear"
      tickFormatter={(hour: number) => `${hour}h`}
      interval={0}
    />
    <Bar dataKey="count" fill="steelblue" isAnimationActive={false}>
      <LabelList
        dataKey="count"
        position="insideTop"
        fill="white"
        formatter={nf.format}
      />
    </Bar>
  </BarChart>
);

const SalesByDay = ({ days }: { days: { name: string; count: number }[] }) => (
  <BarChart data={days} width={800} height={300}>
    <XAxis dataKey="name" />
    <Bar dataKey="count" fill="steelblue" isAnimationActive={false}>
      <LabelList
        dataKey="count"
        position="insideTop"
        fill="white"
        formatter={nf.format}
      />
    </Bar>
  </BarChart>
);

const StatsLoader = () => {
  const result = trpc.useQuery(["stats"]);
  let hourSales: JSX.Element | null = null;
  let daySales: JSX.Element | null = null;
  if (result.status === "error") {
    const error = new Error("Impossible de récupérer les données");
    hourSales = <ErrorMessage error={error} />;
    daySales = hourSales;
  }
  if (result.status === "loading") {
    hourSales = <p>Chargement…</p>;
    daySales = hourSales;
  }
  if (result.status === "success") {
    const hours = Object.entries(result.data.hours)
      .filter((line) => Number(line[0]) >= 8 && Number(line[0]) <= 21)
      .map(([hour, count]) => ({
        hour: Number(hour),
        count,
      }));
    const days = Object.entries(result.data.days).map(([day, count]) => ({
      name: DAYS[Number(day)],
      count,
    }));
    hourSales = <SalesByHour hours={hours} />;
    daySales = <SalesByDay days={days} />;
  }
  return (
    <>
      <Card title="Nombre de ventes par heure">{hourSales}</Card>
      <Card title="Nombre de ventes par jour">{daySales}</Card>
    </>
  );
};

const Stats = (): JSX.Element => (
  <div tw="margin-left[10%] margin-right[10%] flex flex-1 flex-col gap-lg">
    <Title>Statistiques</Title>
    <StatsLoader />
  </div>
);

export default Stats;
