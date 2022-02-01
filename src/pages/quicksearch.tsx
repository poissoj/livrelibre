import "twin.macro";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { Title } from "@/components/Title";
import { useRouter } from "next/router";
import { trpc } from "@/utils/trpc";
import { ItemsTable } from "@/components/ItemsTable";

const SearchLoader = ({ search }: { search: string }) => {
  const result = trpc.useQuery(["quicksearch", search]);
  let subtitle = "Recherche en cours…";
  if (result.isSuccess) {
    const { count } = result.data;
    subtitle = `${count} résultat${count > 1 ? "s" : ""} pour ${search}`;
  }
  return (
    <Card tw="mb-lg max-h-full overflow-hidden flex flex-col">
      <CardTitle>Recherche rapide</CardTitle>
      {subtitle}
      <CardBody>
        {result.isSuccess ? <ItemsTable items={result.data.items} /> : null}
      </CardBody>
    </Card>
  );
};

const QuickSearchPage = (): JSX.Element => {
  const router = useRouter();
  const { search } = router.query;
  const searchValue = typeof search === "string" ? search : "";
  const title = `Recherche de "${searchValue}"`;
  return (
    <div tw="flex flex-1 flex-col gap-lg">
      <Title>{title}</Title>
      {searchValue ? <SearchLoader search={searchValue} /> : null}
    </div>
  );
};

export default QuickSearchPage;
