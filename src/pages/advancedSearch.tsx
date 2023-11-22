import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { ItemsTable } from "@/components/ItemsTable";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Pagination } from "@/components/Pagination";
import { Title } from "@/components/Title";
import { formatTVA } from "@/utils/format";
import { ITEM_TYPES } from "@/utils/item";
import { ITEMS_PER_PAGE } from "@/utils/pagination";
import { trpc } from "@/utils/trpc";
import { isIn } from "@/utils/utils";

const CARD_STYLES = "max-h-full overflow-hidden flex flex-col relative";

const FIELD_LABELS = {
  type: "Type",
  isbn: "ISBN",
  author: "Auteur·ice",
  title: "Titre",
  publisher: "Maison d'édition",
  distributor: "Distributeur",
  keywords: "Mots-clés",
  datebought: "Date d'achat",
  comments: "Commentaires",
  purchasePrice: "Prix d'achat",
  price: "Prix de vente",
  amount: "Quantité",
  tva: "TVA",
};

const formatRow = ([key, value]: [key: string, value: string]) => {
  const fieldName = isIn(FIELD_LABELS, key) ? FIELD_LABELS[key] : key;
  let fieldValue = value;
  if (key === "type" && isIn(ITEM_TYPES, value)) {
    fieldValue = ITEM_TYPES[value];
  } else if (key === "tva") {
    fieldValue = formatTVA(value) || "";
  }
  return `${fieldName}: ${fieldValue}`;
};

const getQueryLabel = (query: Record<string, string>) => {
  const label = Object.entries(query)
    .filter(([, value]) => value !== "")
    .map(formatRow)
    .join(", ");
  return label;
};

const ToggleStock = () => {
  const router = useRouter();
  const toggleStock = async () => {
    const { inStock, ...query } = router.query;
    if (!inStock) {
      query.inStock = "1";
    }
    await router.push({ query });
  };
  return (
    <label className="self-end cursor-pointer mr-6 ml-auto">
      <span>En stock</span>
      <input
        type="checkbox"
        className="ml-2"
        onChange={toggleStock}
        defaultChecked={router.query.inStock == "1"}
      />
    </label>
  );
};

const SearchLoader = ({
  query,
  page,
}: {
  query: Record<string, string>;
  page: number;
}) => {
  const result = trpc.advancedSearch.useQuery(
    { search: query, page },
    {
      keepPreviousData: true,
    },
  );
  let title = "Recherche avancée";
  let subtitle = "Recherche en cours…";
  let pageCount = 0;
  if (result.isSuccess) {
    const { count } = result.data;
    const queryLabel = getQueryLabel(query);
    pageCount = Math.ceil(count / ITEMS_PER_PAGE);
    if (pageCount > 1) {
      title += ` - Page ${page} sur ${pageCount}`;
    }
    subtitle = `${count} résultat${count > 1 ? "s" : ""} pour ${queryLabel}`;
    if (count === 0) {
      return (
        <Card className={CARD_STYLES}>
          <CardTitle>{title}</CardTitle>
          <ToggleStock />
          <CardBody>Aucun résultat pour &quot;{queryLabel}&quot;</CardBody>
          <p className="mt-2">
            <Link href="/search" passHref className="text-primary-darkest">
              Nouvelle recherche
            </Link>
          </p>
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
        {result.isError ? <ErrorMessage /> : null}
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

const filterNonString = (
  object: Record<string, string | string[] | undefined>,
) => {
  const body: Record<string, string> = {};
  for (const [key, value] of Object.entries(object)) {
    if (typeof value === "string" && key !== "page") {
      body[key] = value;
    }
  }
  return body;
};

const SearchResults = () => {
  const router = useRouter();
  const query = router.query;
  const page = typeof query.page === "string" ? Number(query.page) : 1;
  return (
    <div className="flex flex-1 flex-col gap-lg">
      <Title>Recherche avancée</Title>
      <SearchLoader query={filterNonString(query)} page={page} />
    </div>
  );
};

export default SearchResults;
