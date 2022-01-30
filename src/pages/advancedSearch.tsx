import "twin.macro";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { ItemsTable } from "@/components/ItemsTable";
import { Title } from "@/components/Title";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";

const SearchLoader = ({ query }: { query: Record<string, string> }) => {
  const result = trpc.useQuery(["advancedSearch", query]);
  let subtitle = "Recherche en cours…";
  if (result.isSuccess) {
    const { count } = result.data;
    const search = Object.entries(query)
      .filter(([, value]) => value !== "")
      .map((row) => row.join(" = "))
      .join(", ");
    subtitle = `${count} résultat${count > 1 ? "s" : ""} pour ${search}`;
  }
  return (
    <Card tw="mb-lg max-h-full overflow-hidden flex flex-col">
      <CardTitle>Recherche avancée</CardTitle>
      {subtitle}
      <CardBody>
        {result.isError ? <ErrorMessage /> : null}
        {result.isSuccess ? <ItemsTable items={result.data.items} /> : null}
      </CardBody>
    </Card>
  );
};

const filterNonString = (
  object: Record<string, string | string[] | undefined>
) => {
  const body: Record<string, string> = {};
  for (const [key, value] of Object.entries(object)) {
    if (typeof value === "string") {
      body[key] = value;
    }
  }
  return body;
};

const SearchResults = () => {
  const router = useRouter();
  const query = router.query;

  return (
    <div tw="margin-left[10%] margin-right[10%] flex flex-1 flex-col gap-lg">
      <Title>Recherche avancée</Title>
      <SearchLoader query={filterNonString(query)} />
    </div>
  );
};

export default SearchResults;
