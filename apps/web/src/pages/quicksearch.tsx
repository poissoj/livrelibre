import * as React from "react";
import { keepPreviousData } from "@tanstack/react-query";

import { ITEMS_PER_PAGE } from "@livrelibre/shared/pagination";

import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import { ItemsTable } from "@/components/ItemsTable";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Pagination } from "@/components/Pagination";
import { Title } from "@/components/Title";
import { trpc } from "@/utils/trpc";
import { useQueryParams } from "@/utils/useQueryParams";

const CARD_STYLES = "max-h-full overflow-hidden flex flex-col relative";

const useQuickSearchParams = () => {
  const { query } = useQueryParams();
  const search = typeof query.search === "string" ? query.search : "";
  const page = typeof query.page === "string" ? Number(query.page) : 1;
  const inStock = typeof query.inStock === "string";
  return { search, page, inStock };
};

const ToggleStock = () => {
  const { push } = useQueryParams();
  const { search, inStock } = useQuickSearchParams();
  const toggleStock = async () => {
    const query = inStock ? { search } : { search, inStock: 1 };
    await push({ query });
  };
  return (
    <label className="self-end cursor-pointer mr-6 ml-auto">
      <span>En stock</span>
      <input
        type="checkbox"
        className="ml-2"
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
  const result = trpc.quicksearch.useQuery(
    { search, page, inStock },
    {
      placeholderData: keepPreviousData,
    },
  );
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
        <Card className={CARD_STYLES}>
          <CardTitle>{title}</CardTitle>
          <ToggleStock />
          <CardBody>Aucun résultat pour &quot;{search}&quot;</CardBody>
        </Card>
      );
    }
  }
  const Wrapper = result.isFetching ? LoadingOverlay : React.Fragment;

  return (
    <Card className={CARD_STYLES}>
      <CardTitle>{title}</CardTitle>
      <div className="flex flex-1">
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
        <CardFooter className="flex justify-center pt-6 2xl:pt-8">
          <Pagination count={pageCount} />
        </CardFooter>
      ) : null}
    </Card>
  );
};

const QuickSearchPage = (): React.ReactElement => {
  const { search, page, inStock } = useQuickSearchParams();
  const title = `Recherche de "${search}"`;
  return (
    <div className="flex flex-1 flex-col gap-lg">
      <Title>{title}</Title>
      {search ? (
        <SearchLoader search={search} page={page} inStock={inStock} />
      ) : null}
    </div>
  );
};

export default QuickSearchPage;
