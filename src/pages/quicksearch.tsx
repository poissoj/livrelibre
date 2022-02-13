import { useRouter } from "next/router";
import "twin.macro";

import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import { ItemsTable } from "@/components/ItemsTable";
import { Pagination } from "@/components/Pagination";
import { Title } from "@/components/Title";
import { ITEMS_PER_PAGE } from "@/utils/pagination";
import { trpc } from "@/utils/trpc";

const SearchLoader = ({ page, search }: { page: number; search: string }) => {
  const result = trpc.useQuery(["quicksearch", { search, page }], {
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
  }
  return (
    <Card tw="max-h-full overflow-hidden flex flex-col">
      <CardTitle>{title}</CardTitle>
      {subtitle}
      <CardBody>
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

const QuickSearchPage = (): JSX.Element => {
  const router = useRouter();
  const { search, page: queryPage } = router.query;
  const searchValue = typeof search === "string" ? search : "";
  const title = `Recherche de "${searchValue}"`;
  const page = typeof queryPage === "string" ? Number(queryPage) : 1;
  return (
    <div tw="flex flex-1 flex-col gap-lg">
      <Title>{title}</Title>
      {searchValue ? <SearchLoader search={searchValue} page={page} /> : null}
    </div>
  );
};

export default QuickSearchPage;
