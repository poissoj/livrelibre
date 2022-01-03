import "twin.macro";
import { Card } from "@/components/Card";
import { QuickSearch } from "@/components/Dashboard/QuickSearch";
import { Title } from "@/components/Title";
import { useRouter } from "next/router";
import { trpc } from "@/utils/trpc";
import { ItemsTable } from "@/components/ItemsTable";

const SearchLoader = ({ search }: { search: string }) => {
  const result = trpc.useQuery(["quicksearch", search]);
  let subtitle = "Recherche en cours…";
  if (result.isSuccess) {
    subtitle = `${result.data.count} résultats pour ${search}`;
  }
  return (
    <Card
      title="Recherche rapide"
      subtitle={subtitle}
      tw="mb-lg max-h-full overflow-hidden flex flex-col"
    >
      {result.isSuccess ? <ItemsTable items={result.data.items} /> : null}
    </Card>
  );
};

const QuickSearchResults = () => {
  const router = useRouter();
  const { search } = router.query;
  if (typeof search !== "string") {
    return null;
  }
  return <SearchLoader search={search} />;
};

const QuickSearchPage = (): JSX.Element => (
  <div tw="margin-left[10%] margin-right[10%] flex flex-1 flex-col gap-lg">
    <Title>Liste des articles</Title>
    <QuickSearch />
    <QuickSearchResults />
  </div>
);

export default QuickSearchPage;
