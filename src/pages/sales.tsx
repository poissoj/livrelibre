import { Title } from "@/components/Title";
import { Card } from "@/components/Card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/Button";
import tw from "twin.macro";
import { trpc } from "@/utils/trpc";
import { ErrorMessage } from "@/components/ErrorMessage";
import type { Sale } from "@/server/sales";
import Link from "next/link";
import ContentLoader from "react-content-loader";

const StickyTh = tw.th`sticky top-0 bg-white`;
const Cell = tw.td`text-center`;

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
    const error = new Error("Impossible de récupérer les données");
    return <ErrorMessage error={error} />;
  }
  if (result.status === "loading") {
    return <SalesSkeleton />;
  }
  if (result.status === "idle") {
    return null;
  }
  return <SalesTable sales={result.data} />;
};

const makeSaleURL = (sale: Sale) => `/sale/${sale.month.replace("/", "-")}`;

const formatPrice = (price: number) => `${price.toFixed(2)}€`;

const SalesTable = ({ sales }: { sales: Sale[] }): JSX.Element => {
  return (
    <table tw="flex-1">
      <thead>
        <tr>
          <StickyTh>Mois</StickyTh>
          <StickyTh>Nombre de ventes</StickyTh>
          <StickyTh>Recette totale</StickyTh>
          <StickyTh>Panier moyen</StickyTh>
          <StickyTh></StickyTh>
        </tr>
      </thead>
      <tbody tw="line-height[2.3rem]">
        {sales.map((sale, i) => (
          <tr key={i}>
            <Cell>{sale.month}</Cell>
            <Cell>{sale.count}</Cell>
            <Cell>
              <div tw="text-right mx-auto width[10ch]">
                {formatPrice(sale.amount)}
              </div>
            </Cell>
            <Cell>{sale.avg ? `${formatPrice(sale.avg)}` : "Inconnu"}</Cell>
            <Cell>
              <Link href={makeSaleURL(sale)} passHref>
                <Button as="a" tw="background-color[#666]">
                  <FontAwesomeIcon icon={faEye} tw="mr-sm" />
                  Détails
                </Button>
              </Link>
            </Cell>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const Sales = (): JSX.Element => (
  <div tw="margin-left[10%] margin-right[10%] flex-1">
    <Title>Liste des ventes par mois</Title>
    <Card
      title="Liste des ventes par mois"
      tw="mb-lg max-h-full overflow-hidden flex flex-col"
    >
      <SalesLoader />
    </Card>
  </div>
);

export default Sales;
