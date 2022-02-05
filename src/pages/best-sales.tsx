import Link from "next/link";
import ContentLoader from "react-content-loader";
import tw from "twin.macro";

import { Card, CardBody, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Title } from "@/components/Title";
import type { ItemWithCount } from "@/utils/item";
import { trpc } from "@/utils/trpc";

const StickyTh = tw.th`sticky top-0 bg-white`;
const ItemsTable = ({ items }: { items: ItemWithCount[] }) => (
  <table tw="flex-1 border-collapse[separate] border-spacing[2px 0.5rem]">
    <thead>
      <tr>
        <StickyTh tw="text-left">#</StickyTh>
        <StickyTh tw="text-left">Titre</StickyTh>
        <StickyTh tw="text-left">Auteur</StickyTh>
        <StickyTh tw="text-right">Vendus</StickyTh>
        <StickyTh tw="text-right whitespace-nowrap">En stock</StickyTh>
        <StickyTh></StickyTh>
      </tr>
    </thead>
    <tbody>
      {items.map((item, i) => (
        <tr key={i}>
          <td>{i + 1}</td>
          <td>
            <span tw="text-primary-darkest">
              <Link href={`/item/${item._id}`}>{item.title}</Link>
            </span>
          </td>
          <td>{item.author}</td>
          <td tw="text-right font-mono">{item.count}</td>
          <td tw="pr-3 text-right font-mono">{item.amount}</td>
          <td></td>
        </tr>
      ))}
    </tbody>
  </table>
);

const SkeletonRow = ({ n }: { n: number }) => (
  <>
    <rect x="2%" y={n * 30 + 10} width="3%" height={10} rx={5} />
    <rect x="10%" y={n * 30 + 10} width="40%" height={10} />
    <rect x="60%" y={n * 30 + 10} width="20%" height={10} />
    <rect x="83%" y={n * 30 + 10} width="6%" height={10} rx={5} />
    <rect x="92%" y={n * 30 + 10} width="6%" height={10} rx={5} />
  </>
);

const BestSalesSkeleton = () => (
  <ContentLoader height={500} width="100%">
    {Array(17)
      .fill(0)
      .map((_, i) => (
        <SkeletonRow key={i} n={i} />
      ))}
  </ContentLoader>
);

const BestSalesLoader = () => {
  const result = trpc.useQuery(["bestsales"]);
  if (result.status === "error") {
    return <ErrorMessage />;
  }
  if (result.status === "loading") {
    return <BestSalesSkeleton />;
  }
  if (result.status === "idle") {
    return null;
  }
  return <ItemsTable items={result.data} />;
};

const BestSales = (): JSX.Element => (
  <div tw="margin-left[10%] margin-right[10%] flex flex-1 flex-col gap-lg">
    <Title>Meilleurs ventes</Title>
    <Card tw="max-h-full overflow-hidden flex flex-col">
      <CardTitle>Meilleures ventes</CardTitle>
      <CardBody>
        <BestSalesLoader />
      </CardBody>
    </Card>
  </div>
);

export default BestSales;
