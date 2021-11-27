import tw from "twin.macro";
import { Title } from "@/components/Title";
import { trpc } from "@/utils/trpc";
import { Card } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Item } from "@/utils/item";
import Link from "next/link";

const StickyTh = tw.th`sticky top-0 bg-white`;
const ItemsTable = ({ items }: { items: (Item & { count: number })[] }) => (
  <table tw="flex-1 border-collapse[separate] border-spacing[2px 0.5rem]">
    <thead>
      <tr>
        <StickyTh>#</StickyTh>
        <StickyTh>Titre</StickyTh>
        <StickyTh>Auteur</StickyTh>
        <StickyTh>Vendus</StickyTh>
        <StickyTh tw="px-2 whitespace-nowrap">En stock</StickyTh>
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
          <td tw="text-right">{item.count}</td>
          <td tw="pr-3 text-right">{item.amount}</td>
          <td></td>
        </tr>
      ))}
    </tbody>
  </table>
);

const BestSalesLoader = () => {
  const result = trpc.useQuery(["bestsales"]);
  if (result.status === "error") {
    const error = new Error("Impossible de récupérer les données");
    return <ErrorMessage error={error} />;
  }
  if (result.status === "loading") {
    return <p>Chargement…</p>;
  }
  if (result.status === "idle") {
    return null;
  }
  return <ItemsTable items={result.data} />;
};

const BestSales = (): JSX.Element => (
  <div tw="margin-left[10%] margin-right[10%] flex flex-1 flex-col gap-lg">
    <Title>Meilleurs ventes</Title>
    <Card
      title="Meilleures ventes"
      tw="mb-lg max-h-full overflow-hidden flex flex-col"
    >
      <BestSalesLoader />
    </Card>
  </div>
);

export default BestSales;
