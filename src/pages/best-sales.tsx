import { clsx } from "clsx";
import Link from "next/link";
import ContentLoader from "react-content-loader";

import { Card, CardBody, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Title } from "@/components/Title";
import { formatNumber } from "@/utils/format";
import type { ItemWithCount } from "@/utils/item";
import { trpc } from "@/utils/trpc";

const TH_STYLES = "sticky top-0 bg-white";

const ItemsTable = ({ items }: { items: ItemWithCount[] }) => (
  <table className="flex-1 [border-collapse:separate] [border-spacing:2px_0.5rem]">
    <thead>
      <tr>
        <th className={clsx(TH_STYLES, "text-left")}>#</th>
        <th className={clsx(TH_STYLES, "text-left")}>Titre</th>
        <th className={clsx(TH_STYLES, "text-left")}>Auteur·ice</th>
        <th className={clsx(TH_STYLES, "text-right")}>Vendus</th>
        <th className={clsx(TH_STYLES, "text-right whitespace-nowrap")}>
          En stock
        </th>
        <th className={TH_STYLES}></th>
      </tr>
    </thead>
    <tbody>
      {items.map((item, i) => (
        <tr key={i}>
          <td>{i + 1}</td>
          <td>
            <span className="text-primary-darkest">
              <Link href={`/item/${item._id}`}>{item.title}</Link>
            </span>
          </td>
          <td>{item.author}</td>
          <td className="text-right font-number">{formatNumber(item.count)}</td>
          <td className="pr-3 text-right font-number">
            {formatNumber(item.amount)}
          </td>
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
  const result = trpc.bestsales.useQuery();
  if (result.status === "error") {
    return <ErrorMessage />;
  }
  if (result.status === "loading") {
    return <BestSalesSkeleton />;
  }
  return <ItemsTable items={result.data} />;
};

const BestSales = (): JSX.Element => (
  <div className="[margin-left:10%] [margin-right:10%] flex flex-1 flex-col gap-lg">
    <Title>Meilleurs ventes</Title>
    <Card className="max-h-full overflow-hidden flex flex-col">
      <CardTitle>Meilleures ventes</CardTitle>
      <CardBody>
        <BestSalesLoader />
      </CardBody>
    </Card>
  </div>
);

export default BestSales;
