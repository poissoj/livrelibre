import tw from "twin.macro";
import { Title } from "@/components/Title";
import { Card } from "@/components/Card";
import { useRouter } from "next/router";
import { InferQueryOutput, trpc } from "@/utils/trpc";
import Link from "next/link";
import { Button } from "@/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import ContentLoader from "react-content-loader";
import { ErrorMessage } from "@/components/ErrorMessage";

const StickyTh = tw.th`sticky top-0 bg-white`;

type TSalesByDay = InferQueryOutput<"salesByMonth">["salesByDay"];
type TStats = InferQueryOutput<"salesByMonth">["stats"];
type TCategories = InferQueryOutput<"salesByMonth">["itemTypes"];

const makeSaleURL = (date: string) =>
  `/sale/${date.split("/").reverse().join("/")}`;

const SalesTable = ({ sales }: { sales: TSalesByDay }) => {
  return (
    <table tw="flex-1">
      <thead>
        <tr>
          <StickyTh tw="text-left">Jour</StickyTh>
          <StickyTh tw="text-right">Nombre de ventes</StickyTh>
          <StickyTh tw="text-right">Recette totale</StickyTh>
          <StickyTh></StickyTh>
        </tr>
      </thead>
      <tbody tw="line-height[2.3rem]">
        {sales.map((sale, i) => (
          <tr key={i}>
            <td>{sale.date}</td>
            <td tw="text-right font-mono">{sale.count}</td>
            <td tw="text-right font-mono ">{sale.amount}€</td>
            <td tw="text-center pl-2">
              <Link href={makeSaleURL(sale.date)} passHref>
                <Button as="a" tw="background-color[#666]">
                  <FontAwesomeIcon icon={faEye} tw="mr-sm" />
                  Détails
                </Button>
              </Link>
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

const TVASkeletonRow = ({ n }: { n: number }) => (
  <>
    <rect x="5%" y={n * 30 + 15} rx="2" ry="2" width="19%" height="10" />
    <rect x="27%" y={n * 30 + 15} rx="2" ry="2" width="19%" height="10" />
    <rect x="49%" y={n * 30 + 15} rx="2" ry="2" width="19%" height="10" />
    <rect x="71%" y={n * 30 + 15} rx="2" ry="2" width="19%" height="10" />
  </>
);

const CategorySkeletonRow = ({ n }: { n: number }) => (
  <>
    <rect x="5%" y={n * 30 + 15} rx="2" ry="2" width="27%" height="10" />
    <rect x="35%" y={n * 30 + 15} rx="2" ry="2" width="27%" height="10" />
    <rect x="65%" y={n * 30 + 15} rx="2" ry="2" width="27%" height="10" />
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

const TVASkeleton = (): JSX.Element => (
  <ContentLoader height={300} width="100%">
    {Array(9)
      .fill(0)
      .map((_, i) => (
        <TVASkeletonRow key={i} n={i} />
      ))}
  </ContentLoader>
);

const CategorySkeleton = (): JSX.Element => (
  <ContentLoader height={150} width="100%">
    {Array(5)
      .fill(0)
      .map((_, i) => (
        <CategorySkeletonRow key={i} n={i} />
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
    const error = new Error("Impossible de récupérer les données");
    return <ErrorMessage error={error} />;
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
  const title = `Liste des ventes du ${month}/${year}`;
  return (
    <Card title={title} tw="flex flex-col flex-1 max-h-full overflow-hidden">
      <SalesLoader month={month} year={year} />
    </Card>
  );
};

const formatTVA = (tva: string) => (tva === "Inconnu" ? tva : `${tva}%`);

const StatsByTVA = ({ stats }: { stats: TStats }) => {
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

const TVALoader = (props: MonthProps) => {
  const result = trpc.useQuery(["salesByMonth", props]);
  if (result.isError) {
    const error = new Error("Impossible de récupérer les données");
    return <ErrorMessage error={error} />;
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
    <Card title="Répartition par TVA" tw="min-height[12rem] flex flex-col">
      <TVALoader month={month} year={year} />
    </Card>
  );
};

const CategoriesTable = ({ categories }: { categories: TCategories }) => (
  <table tw="flex-1">
    <thead>
      <tr>
        <StickyTh tw="text-left">Catégorie</StickyTh>
        <StickyTh tw="text-right">Quantité</StickyTh>
        <StickyTh tw="text-right">Total</StickyTh>
      </tr>
    </thead>
    <tbody tw="line-height[1.9rem]">
      {categories.map((category, i) => (
        <tr key={i}>
          <td>{category.type}</td>
          <td tw="text-right font-mono">{category.nb}</td>
          <td tw="text-right font-mono">{category.totalPrice}€</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const CategoriesLoader = (props: MonthProps) => {
  const result = trpc.useQuery(["salesByMonth", props]);
  if (result.isError) {
    const error = new Error("Impossible de récupérer les données");
    return <ErrorMessage error={error} />;
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
    <Card title="Répartition par catégorie">
      <CategoriesLoader month={month} year={year} />
    </Card>
  );
};

const SalesByMonth = (): JSX.Element => {
  return (
    <div tw="flex align-items[flex-start] gap-lg flex-1 flex-wrap">
      <Title>Voir un article</Title>
      <SalesCard />
      <div tw="flex flex-col gap-lg flex-1 max-h-full">
        <TVACard />
        <CategoriesCard />
      </div>
    </div>
  );
};

export default SalesByMonth;
