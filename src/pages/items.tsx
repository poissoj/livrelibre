import React, { PropsWithChildren } from "react";
import ContentLoader from "react-content-loader";
import "twin.macro";

import { Card, CardBody, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { ItemsTable } from "@/components/ItemsTable";
import { Title } from "@/components/Title";
import { trpc } from "@/utils/trpc";

const ItemsCard = ({
  title,
  subtitle,
  children,
}: PropsWithChildren<{ title: string; subtitle?: React.ReactNode }>) => (
  <Card tw="max-h-full overflow-hidden flex flex-col">
    <CardTitle>{title}</CardTitle>
    {subtitle}
    <CardBody>{children}</CardBody>
  </Card>
);

const SkeletonRow = ({ n }: { n: number }) => (
  <>
    <rect x="2%" y={n * 30 + 15} rx="2" ry="2" width="25%" height="10" />
    <rect x="32%" y={n * 30 + 15} rx="2" ry="2" width="25%" height="10" />
    <rect x="62%" y={n * 30 + 15} rx="2" ry="2" width="25%" height="10" />
    <rect x="92%" y={n * 30 + 15} rx="2" ry="2" width="6%" height="10" />
  </>
);

const ItemsSkeleton = (): JSX.Element => (
  <ContentLoader height={300} width="100%">
    {Array(10)
      .fill(0)
      .map((_, i) => (
        <SkeletonRow key={i} n={i} />
      ))}
  </ContentLoader>
);

const ItemsLoader = () => {
  const result = trpc.useQuery(["items"]);
  const title = "Liste des articles";
  if (result.status === "error") {
    return (
      <ItemsCard title={title}>
        <ErrorMessage />
      </ItemsCard>
    );
  }
  if (result.status === "loading") {
    return (
      <ItemsCard title={title}>
        <ItemsSkeleton />
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
  <div tw="flex flex-1 flex-col gap-lg">
    <Title>Liste des articles</Title>
    <ItemsLoader />
  </div>
);

export default Items;
