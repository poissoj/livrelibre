import { useRouter } from "next/router";
import React from "react";
import ContentLoader from "react-content-loader";
import "twin.macro";

import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { ItemsTable } from "@/components/ItemsTable";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Pagination } from "@/components/Pagination";
import { Title } from "@/components/Title";
import { trpc } from "@/utils/trpc";

const ItemsCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  children: React.ReactNode;
  subtitle?: React.ReactNode;
}) => (
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

const ItemsLoader = ({ page }: { page: number }) => {
  const result = trpc.useQuery(["items", page], { keepPreviousData: true });
  let pageTitle = "Liste des articles";
  if (result.status === "error") {
    return (
      <ItemsCard title={pageTitle}>
        <ErrorMessage />
      </ItemsCard>
    );
  }
  if (result.status === "loading") {
    return (
      <ItemsCard title={pageTitle}>
        <ItemsSkeleton />
      </ItemsCard>
    );
  }
  if (result.status === "idle") {
    return null;
  }
  const { count, pageCount, items } = result.data;
  let title = "Tous les articles";
  if (pageCount > 1) {
    const pageLabel = `Page ${page} sur ${pageCount}`;
    title += " - " + pageLabel;
    pageTitle += " | " + pageLabel;
  }
  const Wrapper = result.isFetching ? LoadingOverlay : React.Fragment;

  return (
    <Card tw="max-h-full overflow-hidden flex flex-col relative">
      <Title>{pageTitle}</Title>
      <CardTitle>{title}</CardTitle>
      <p tw="mt-sm">{count} articles</p>
      <CardBody>
        <Wrapper>
          <ItemsTable items={items} />
        </Wrapper>
      </CardBody>
      {pageCount > 1 ? (
        <CardFooter tw="flex justify-center pt-6 2xl:pt-8">
          <Pagination count={pageCount} />
        </CardFooter>
      ) : null}
    </Card>
  );
};

const Items = (): JSX.Element => {
  const router = useRouter();
  const { page: queryPage } = router.query;
  const page = typeof queryPage === "string" ? Number(queryPage) : 1;
  return (
    <div tw="flex flex-1 flex-col gap-lg">
      <Title>Liste des articles</Title>
      <ItemsLoader page={page} />
    </div>
  );
};

export default Items;
