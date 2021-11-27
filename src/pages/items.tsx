import tw from "twin.macro";
import Link from "next/link";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Title } from "@/components/Title";
import { Card } from "@/components/Card";
import { trpc } from "@/utils/trpc";
import { Item } from "@/utils/item";
import React, { PropsWithChildren } from "react";
import { QuickSearch } from "@/components/Dashboard/QuickSearch";

const StickyTh = tw.th`sticky top-0 bg-white`;
const ItemsTable = ({ items }: { items: Item[] }) => (
  <table tw="flex-1">
    <thead>
      <tr>
        <StickyTh>Distributeur</StickyTh>
        <StickyTh>Titre</StickyTh>
        <StickyTh>Auteur</StickyTh>
        <StickyTh>Quantité</StickyTh>
        <StickyTh></StickyTh>
      </tr>
    </thead>
    <tbody tw="line-height[2.3rem]">
      {items.map((item, i) => (
        <tr key={i}>
          <td>{item.distributor}</td>
          <td>
            <span tw="text-primary-darkest">
              <Link href={`/item/${item._id}`}>{item.title}</Link>
            </span>
          </td>
          <td>{item.author}</td>
          <td>{item.amount}</td>
          <td></td>
        </tr>
      ))}
    </tbody>
  </table>
);

const ItemsCard = ({
  title,
  subtitle,
  children,
}: PropsWithChildren<{ title: string; subtitle?: React.ReactNode }>) => (
  <Card
    title={title}
    subtitle={subtitle}
    tw="mb-lg max-h-full overflow-hidden flex flex-col"
  >
    {children}
  </Card>
);

const ItemsLoader = () => {
  const result = trpc.useQuery(["items"]);
  const title = "Liste des articles";
  if (result.status === "error") {
    const error = new Error("Impossible de récupérer les données");
    return (
      <ItemsCard title={title}>
        <ErrorMessage error={error} />
      </ItemsCard>
    );
  }
  if (result.status === "loading") {
    return (
      <ItemsCard title={title}>
        <p>Chargement…</p>
      </ItemsCard>
    );
  }
  if (result.status === "idle") {
    return null;
  }
  const { count, pageCount, items } = result.data;
  const pageTitle = `Liste des articles | Page 1 sur ${pageCount}`;
  return (
    <ItemsCard
      title={`Tous les articles - Page 1 sur ${pageCount}`}
      subtitle={<p tw="mt-sm">{count} articles</p>}
    >
      <Title>{pageTitle}</Title>
      <ItemsTable items={items} />
    </ItemsCard>
  );
};

const Items = (): JSX.Element => (
  <div tw="margin-left[10%] margin-right[10%] flex flex-1 flex-col gap-lg">
    <Title>Liste des articles</Title>
    <QuickSearch />
    <ItemsLoader />
  </div>
);

export default Items;
