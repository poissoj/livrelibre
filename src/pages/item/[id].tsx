import { useRouter } from "next/router";
import { ErrorMessage } from "@/components/ErrorMessage";
import { NoResults } from "@/components/NoResults";
import { Title } from "@/components/Title";
import { Card } from "@/components/Card";
import { QuickSearch } from "@/components/Dashboard/QuickSearch";
import { trpc } from "@/utils/trpc";
import { ItemWithCount, ITEM_TYPES } from "@/utils/item";
import tw from "twin.macro";
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";

const DL = tw.dl`flex flex-wrap min-width[24rem]`;
const DT = tw.dt`flex-basis[30%] p-sm font-medium`;
const DD = tw.dd`flex[1 0 70%] p-sm`;

const formatPrice = (price: string) => (price ? `${price}€` : "");

const ItemDetails = ({ item }: { item: ItemWithCount }) => {
  return (
    <DL>
      <DT>Type</DT>
      <DD>{ITEM_TYPES[item.type]}</DD>
      <DT>ISBN</DT>
      <DD>{item.isbn}</DD>
      <DT>Auteur</DT>
      <DD>{item.author}</DD>
      <DT>Titre</DT>
      <DD>{item.title}</DD>
      <DT>Éditeur</DT>
      <DD>{item.publisher}</DD>
      <DT>Distributeur</DT>
      <DD>{item.distributor}</DD>
      <DT>Mots-clés</DT>
      <DD>{item.keywords}</DD>
      <DT>Date d&rsquo;achat</DT>
      <DD>{item.datebought}</DD>
      <DT>Commentaires</DT>
      <DD>
        <pre>{item.comments}</pre>
      </DD>
      <DT>Prix d&rsquo;achat</DT>
      <DD>{formatPrice(item.prix_achat)}</DD>
      <DT>Prix de vente</DT>
      <DD>{formatPrice(item.price)}</DD>
      <DT>Quantité</DT>
      <DD>{item.amount}</DD>
      <DT>TVA</DT>
      <DD>{item.tva}%</DD>
      <DT>Vendu</DT>
      <DD>{item.count} fois</DD>
    </DL>
  );
};

const ItemLoader = ({ id }: { id: string }) => {
  const result = trpc.useQuery(["searchItem", id]);

  if (result.status === "error") {
    const error = new Error("Impossible de récupérer les données");
    return (
      <Card title="Article en erreur" tw="flex-1">
        <ErrorMessage error={error} />
      </Card>
    );
  }
  if (result.status === "success") {
    return result.data ? (
      <Card title={result.data.title} tw="flex-1">
        <Title>{`${result.data.title} | Voir un article`}</Title>
        <ItemDetails item={result.data} />
      </Card>
    ) : (
      <Card title="Article introuvable" tw="flex-1">
        <NoResults />
      </Card>
    );
  }
  return (
    <Card title="Chargement…" tw="flex-1">
      Chargement…
    </Card>
  );
};

const ItemCard = () => {
  const router = useRouter();
  const { id } = router.query;
  if (typeof id !== "string") {
    return null;
  }
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return (
      <Card title="Article introuvable" tw="flex-1">
        <NoResults />
      </Card>
    );
  }
  return <ItemLoader id={id} />;
};

/* Don't display 0 for empty columns, they appear on top of labels */
const formatter = (n: number) => (n ? n : "");

const labelFormatter = (_label: string, payload: Payload<string, number>[]) =>
  payload[0]?.payload.fullMonthLabel;
const tooltipFormatter = (count: number) => [count, "ventes"];

const SalesByMonth = ({ sales }: { sales: unknown[] }) => (
  <ResponsiveContainer height={350} width="100%">
    <BarChart data={sales}>
      <XAxis dataKey="monthLabel" />
      <Tooltip labelFormatter={labelFormatter} formatter={tooltipFormatter} />
      <Bar dataKey="count" fill="steelblue" isAnimationActive={false}>
        <LabelList
          dataKey="count"
          position="insideTop"
          fill="white"
          formatter={formatter}
        />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

const Sales = ({ id }: { id: string }) => {
  const result = trpc.useQuery(["salesByMonth", id]);
  if (result.status === "error") {
    const error = new Error("Impossible de récupérer les données");
    return <ErrorMessage error={error} />;
  }
  if (result.status === "loading" || result.status === "idle") {
    return <p>Chargement…</p>;
  }
  return <SalesByMonth sales={result.data} />;
};

const SalesCard = () => {
  const router = useRouter();
  const { id } = router.query;
  if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
    return null;
  }
  return (
    <Card title="Ventes des 2 dernières années" tw="mb-lg">
      <Sales id={id} />
    </Card>
  );
};

const ItemPage = (): JSX.Element => (
  <div tw="flex align-items[flex-start] gap-lg flex-1 flex-wrap">
    <Title>Voir un article</Title>
    <ItemCard />
    <div tw="flex flex-col gap-lg flex-1">
      <QuickSearch />
      <SalesCard />
    </div>
  </div>
);

export default ItemPage;
