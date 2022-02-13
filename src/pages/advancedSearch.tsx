import { useRouter } from "next/router";
import "twin.macro";

import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { ItemsTable } from "@/components/ItemsTable";
import { Pagination } from "@/components/Pagination";
import { Title } from "@/components/Title";
import { ITEMS_PER_PAGE } from "@/utils/pagination";
import { trpc } from "@/utils/trpc";

const SearchLoader = ({
  query,
  page,
}: {
  query: Record<string, string>;
  page: number;
}) => {
  const result = trpc.useQuery(["advancedSearch", { search: query, page }], {
    keepPreviousData: true,
  });
  let title = "Recherche avancée";
  let subtitle = "Recherche en cours…";
  let pageCount = 0;
  if (result.isSuccess) {
    const { count } = result.data;
    const search = Object.entries(query)
      .filter(([, value]) => value !== "")
      .map((row) => row.join(" = "))
      .join(", ");
    pageCount = Math.ceil(count / ITEMS_PER_PAGE);
    if (pageCount > 1) {
      title += ` - Page ${page} sur ${pageCount}`;
    }
    subtitle = `${count} résultat${count > 1 ? "s" : ""} pour ${search}`;
  }
  return (
    <Card tw="max-h-full overflow-hidden flex flex-col">
      <CardTitle>{title}</CardTitle>
      {subtitle}
      <CardBody>
        {result.isError ? <ErrorMessage /> : null}
        {result.isSuccess ? <ItemsTable items={result.data.items} /> : null}
      </CardBody>
      {pageCount > 1 ? (
        <CardFooter tw="flex justify-center pt-6 2xl:pt-8">
          <Pagination count={pageCount} />
        </CardFooter>
      ) : null}
    </Card>
  );
};

const filterNonString = (
  object: Record<string, string | string[] | undefined>
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
    <div tw="flex flex-1 flex-col gap-lg">
      <Title>Recherche avancée</Title>
      <SearchLoader query={filterNonString(query)} page={page} />
    </div>
  );
};

export default SearchResults;
