import { useRouter } from "next/router";
import React, { type ReactElement } from "react";
import ContentLoader from "react-content-loader";

import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { ItemsCard } from "@/components/ItemsCard";
import { ItemsTable } from "@/components/ItemsTable";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Pagination } from "@/components/Pagination";
import { Title } from "@/components/Title";
import { trpc } from "@/utils/trpc";

const SkeletonRow = ({ n }: { n: number }) => (
  <>
    <rect x="2%" y={n * 30 + 15} rx="2" ry="2" width="25%" height="10" />
    <rect x="32%" y={n * 30 + 15} rx="2" ry="2" width="25%" height="10" />
    <rect x="62%" y={n * 30 + 15} rx="2" ry="2" width="25%" height="10" />
    <rect x="92%" y={n * 30 + 15} rx="2" ry="2" width="6%" height="10" />
  </>
);

const ItemsSkeleton = (): ReactElement => (
  <ContentLoader height={300} width="100%">
    {Array(10)
      .fill(0)
      .map((_, i) => (
        <SkeletonRow key={i} n={i} />
      ))}
  </ContentLoader>
);

const ItemsLoader = ({ page }: { page: number }) => {
  const result = trpc.items.useQuery(page, { keepPreviousData: true });
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
  const { count, pageCount, items } = result.data;
  let title = "Tous les articles";
  if (pageCount > 1) {
    const pageLabel = `Page ${page} sur ${pageCount}`;
    title += " - " + pageLabel;
    pageTitle += " | " + pageLabel;
  }
  const Wrapper = result.isFetching ? LoadingOverlay : React.Fragment;

  return (
    <Card className="max-h-full overflow-hidden flex flex-col relative">
      <Title>{pageTitle}</Title>
      <CardTitle>{title}</CardTitle>
      <p className="mt-sm">{count} articles</p>
      <CardBody>
        <Wrapper>
          <ItemsTable items={items} />
        </Wrapper>
      </CardBody>
      {pageCount > 1 ? (
        <CardFooter className="flex justify-center pt-6 2xl:pt-8">
          <Pagination count={pageCount} />
        </CardFooter>
      ) : null}
    </Card>
  );
};

const Items = (): ReactElement => {
  const router = useRouter();
  const { page: queryPage } = router.query;
  const page = typeof queryPage === "string" ? Number(queryPage) : 1;
  return (
    <div className="flex flex-1 flex-col gap-lg">
      <Title>Liste des articles</Title>
      <ItemsLoader page={page} />
    </div>
  );
};

export default Items;
