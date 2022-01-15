import tw from "twin.macro";
import { Card } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { CategoriesTable } from "@/components/PaymentStats/CategoriesTable";
import { CategorySkeleton } from "@/components/PaymentStats/CategorySkeleton";
import { Title } from "@/components/Title";
import { StatsByTVA } from "@/components/TVAStats/StatsByTVA";
import { TVASkeleton } from "@/components/TVAStats/TVASkeleton";
import { InferQueryOutput, trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import type { GetStaticPaths, GetStaticProps } from "next";
import { createSSGHelpers } from "@trpc/react/ssg";
import { appRouter } from "@/pages/api/trpc/[trpc]";

const TVALoader = ({ date }: { date: string }) => {
  const result = trpc.useQuery(["salesByDay", date]);
  if (result.isError) {
    return <ErrorMessage />;
  }
  if (result.isLoading) {
    return <TVASkeleton />;
  }
  if (result.isIdle) {
    return null;
  }
  return <StatsByTVA stats={result.data.tva} />;
};

const CategoriesLoader = ({ date }: { date: string }) => {
  const result = trpc.useQuery(["salesByDay", date]);
  if (result.isError) {
    return <ErrorMessage />;
  }
  if (result.isLoading) {
    return <CategorySkeleton />;
  }
  if (result.isIdle) {
    return null;
  }
  return <CategoriesTable categories={result.data.paymentMethods} />;
};

const StickyTh = tw.th`sticky top-0 bg-white`;

const DeleteSale = () => (
  <button
    type="button"
    name="saleId"
    aria-label="Supprimer la vente"
    tw="px-sm py-xs bg-primary-dark text-white border-radius[3px]"
    title="Supprimer"
  >
    <FontAwesomeIcon icon={faTrashAlt} />
  </button>
);

type Carts = InferQueryOutput<"salesByDay">["carts"];

const SalesRow = ({
  deleted,
  children,
}: {
  deleted: boolean;
  children: React.ReactNode;
}) => <tr css={[deleted && tw`line-through italic`]}>{children}</tr>;

const Cell = tw.td`p-sm`;

const SalesTables = ({ carts }: { carts: Carts }) => {
  return (
    <table tw="flex-1" cellPadding={8}>
      <thead>
        <tr>
          <StickyTh tw="text-left">Titre</StickyTh>
          <StickyTh tw="text-left">Auteur</StickyTh>
          <StickyTh tw="text-right">Quantité</StickyTh>
          <StickyTh tw="text-right">Prix total</StickyTh>
          <StickyTh tw="text-right">TVA</StickyTh>
          <StickyTh tw="text-left">Paiement</StickyTh>
          <StickyTh></StickyTh>
        </tr>
      </thead>
      {carts.map((cart, i) => (
        <tbody tw="odd:bg-gray-light" key={i}>
          {cart.sales.map((sale) => (
            <SalesRow key={sale.saleItemId} deleted={sale.deleted}>
              <Cell>
                {sale.itemId ? (
                  <Link href={`/item/${sale.itemId}`} passHref>
                    <a tw="text-primary-darkest">{sale.title}</a>
                  </Link>
                ) : (
                  sale.title
                )}
              </Cell>
              <Cell>{"author" in sale ? sale.author : ""}</Cell>
              <Cell tw="text-right font-mono">{sale.quantity}</Cell>
              <Cell tw="text-right font-mono">{sale.price.toFixed(2)}€</Cell>
              <Cell tw="text-right font-mono">{sale.tva}%</Cell>
              <Cell tw="whitespace-nowrap">{sale.type}</Cell>
              <Cell tw="pr-3">{sale.deleted ? null : <DeleteSale />}</Cell>
            </SalesRow>
          ))}
        </tbody>
      ))}
    </table>
  );
};

const CardBody = tw.div`mt-md overflow-auto h-full pb-5 flex`;

const SalesLoader = ({ date }: { date: string }) => {
  const result = trpc.useQuery(["salesByDay", date]);
  if (result.isError) {
    return <ErrorMessage />;
  }
  if (result.isLoading) {
    return <p>Chargement…</p>;
  }
  if (result.isIdle) {
    return null;
  }
  return (
    <Card
      title={`Ventes du ${date} (${result.data.salesCount})`}
      tw="flex-1 flex-basis[100%] h-full overflow-hidden"
      BodyWrapper={CardBody}
    >
      <SalesTables carts={result.data.carts} />
    </Card>
  );
};

const SalesByDay = (): JSX.Element | null => {
  const router = useRouter();
  const { day, month, year } = router.query;
  if (
    typeof day !== "string" ||
    typeof month !== "string" ||
    typeof year !== "string"
  ) {
    return null;
  }
  const date = `${day}/${month}/${year}`;
  const title = `Liste des ventes du ${date}`;
  return (
    <div tw="flex align-items[flex-start] gap-lg flex-1 flex-wrap overflow-auto h-full">
      <Title>{title}</Title>
      <Card title="Répartition par TVA" tw="flex-1">
        <TVALoader date={date} />
      </Card>
      <Card title="Répartition par type de paiement" tw="flex-1">
        <CategoriesLoader date={date} />
      </Card>
      <SalesLoader date={date} />
    </div>
  );
};

export default SalesByDay;

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: {},
  });
  const year = context.params?.year;
  const month = context.params?.month;
  const day = context.params?.day;
  if (
    typeof year === "string" &&
    typeof month === "string" &&
    typeof day === "string"
  ) {
    const date = `${day}/${month}/${year}`;
    await ssg.fetchQuery("salesByDay", date);
  }
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 1,
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};
