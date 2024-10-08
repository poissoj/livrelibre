import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import React, { type ReactElement, useReducer, useState } from "react";
import ContentLoader from "react-content-loader";

import { LinkButton } from "@/components/Button";
import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import { CustomersTable } from "@/components/CustomersTable";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Input } from "@/components/FormControls";
import { ItemsCard } from "@/components/ItemsCard";
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

const CustomersLoader = ({ page }: { page: number }) => {
  const [search, setSearch] = useState("");
  const [withPurchases, toggleWithPurchases] = useReducer((v) => !v, false);
  const query = { pageNumber: page, fullname: search, withPurchases };

  const result = trpc.customers.useQuery(query, { keepPreviousData: true });

  let pageTitle = "Liste des client⋅es";
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
  let title = `${count} client⋅es `;
  if (pageCount > 1) {
    const pageLabel = `Page ${page} sur ${pageCount}`;
    title += " - " + pageLabel;
    pageTitle += " | " + pageLabel;
  }
  const Wrapper = result.isFetching ? LoadingOverlay : React.Fragment;

  return (
    <Card className="max-h-full overflow-hidden flex flex-col relative">
      <Title>{pageTitle}</Title>
      <CardTitle className="flex items-center">
        {title}
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          className="mx-auto !w-[13rem] text-base"
          placeholder="Nom, prénom"
        />
        <label className="text-base cursor-pointer">
          <span>Avec achats</span>
          <input
            type="checkbox"
            onChange={toggleWithPurchases}
            className="ml-2"
          />
        </label>
        <LinkButton href="/customer/new" className="ml-auto">
          <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
          Nouveau client
        </LinkButton>
      </CardTitle>
      <CardBody>
        <Wrapper>
          <CustomersTable items={items} />
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

const Customers = (): ReactElement => {
  const router = useRouter();
  const { page: queryPage } = router.query;
  const page = typeof queryPage === "string" ? Number(queryPage) : 1;
  return (
    <div className="flex flex-1 flex-col gap-lg">
      <Title>Liste des client⋅es</Title>
      <CustomersLoader page={page} />
    </div>
  );
};

export default Customers;
