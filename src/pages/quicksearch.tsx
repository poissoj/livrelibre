import * as React from "react";
import { useRouter } from "next/router";
import tw from "twin.macro";

import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import { ItemsTable } from "@/components/ItemsTable";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Pagination } from "@/components/Pagination";
import { Title } from "@/components/Title";
import { ITEMS_PER_PAGE } from "@/utils/pagination";
import { trpc } from "@/utils/trpc";

const StyledCard = tw(Card)`max-h-full overflow-hidden flex flex-col relative`;

const useSearchParams = () => {
  const router = useRouter();
  const {
    search: querySearch,
    page: queryPage,
    inStock: queryStock,
  } = router.query;
  const search = typeof querySearch === "string" ? querySearch : "";
  const page = typeof queryPage === "string" ? Number(queryPage) : 1;
  const inStock = typeof queryStock === "string";
  return { search, page, inStock };
};

const ToggleStock = () => {
  const router = useRouter();
  const { search, inStock } = useSearchParams();
  const toggleStock = async () => {
    const query = inStock ? { search } : { search, inStock: 1 };
    await router.push({ query });
  };
  return (
    <label tw="self-end cursor-pointer mr-6 ml-auto">
      <span>En stock</span>
      <input
        type="checkbox"
        tw="ml-2"
        onChange={toggleStock}
        defaultChecked={inStock}
      />
    </label>
  );
};

const SearchLoader = ({
  page,
  search,
  inStock,
}: {
  page: number;
  search: string;
  inStock: boolean;
}) => {
    const result = trpc.quicksearch.useQuery({ search, page, inStock }, {
        keepPreviousData: true,
    });
  let title = "Recherche rapide";
  let subtitle = "Recherche en cours…";
  let pageCount = 0;
  if (result.isSuccess) {
    const { count } = result.data;
    pageCount = Math.ceil(count / ITEMS_PER_PAGE);
    if (pageCount > 1) {
      title += ` - Page ${page} sur ${pageCount}`;
    }
    subtitle = `${count} résultat${count > 1 ? "s" : ""} pour ${search}`;
    if (count === 0) {
      return (
        <StyledCard>
          <CardTitle>{title}</CardTitle>
          <ToggleStock />
          <CardBody>Aucun résultat pour &quot;{search}&quot;</CardBody>
        </StyledCard>
      );
    }
  }
  const Wrapper = result.isFetching ? LoadingOverlay : React.Fragment;

  return (
    <StyledCard>
      <CardTitle>{title}</CardTitle>
      <div tw="flex flex-1">
        {subtitle}
        <ToggleStock />
      </div>
      <CardBody>
        {result.isSuccess ? (
          <Wrapper>
            <ItemsTable items={result.data.items} />
          </Wrapper>
        ) : null}
      </CardBody>
      {pageCount > 1 ? (
        <CardFooter tw="flex justify-center pt-6 2xl:pt-8">
          <Pagination count={pageCount} />
        </CardFooter>
      ) : null}
    </StyledCard>
  );
};

const QuickSearchPage = (): JSX.Element => {
  const { search, page, inStock } = useSearchParams();
  const title = `Recherche de "${search}"`;
  return (
    <div tw="flex flex-1 flex-col gap-lg">
      <Title>{title}</Title>
      {search ? (
        <SearchLoader search={search} page={page} inStock={inStock} />
      ) : null}
    </div>
  );
};

export default QuickSearchPage;
