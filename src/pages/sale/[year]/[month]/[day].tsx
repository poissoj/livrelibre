import { faSpinner, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createSSGHelpers } from "@trpc/react/ssg";
import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import tw from "twin.macro";

import { Button } from "@/components/Button";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { CategoriesTable } from "@/components/PaymentStats/CategoriesTable";
import { CategorySkeleton } from "@/components/PaymentStats/CategorySkeleton";
import { StatsByTVA } from "@/components/TVAStats/StatsByTVA";
import { TVASkeleton } from "@/components/TVAStats/TVASkeleton";
import { Title } from "@/components/Title";
import { appRouter } from "@/pages/api/trpc/[trpc]";
import { createContext } from "@/server/context";
import { formatPrice, formatTVA } from "@/utils/format";
import { InferQueryOutput, trpc } from "@/utils/trpc";

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

const DeleteSale = ({
  saleId,
  itemId,
}: {
  saleId: string;
  itemId: string | null;
}) => {
  const utils = trpc.useContext();
  const { mutate, isLoading } = trpc.useMutation("deleteSale", {
    async onSuccess() {
      await utils.invalidateQueries("salesByDay");
    },
  });
  return (
    <Button
      type="button"
      name="saleId"
      aria-label="Supprimer la vente"
      tw="background-color[#FF9800]"
      title="Supprimer"
      onClick={() => {
        mutate({ saleId, itemId });
      }}
    >
      <FontAwesomeIcon
        icon={isLoading ? faSpinner : faTrashAlt}
        spin={isLoading}
      />
    </Button>
  );
};

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
            <SalesRow key={sale._id} deleted={sale.deleted}>
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
              <Cell tw="text-right font-mono">{formatPrice(sale.price)}</Cell>
              <Cell tw="text-right font-mono">{formatTVA(sale.tva)}</Cell>
              <Cell tw="whitespace-nowrap">{sale.type}</Cell>
              <Cell tw="pr-3">
                {sale.deleted ? null : (
                  <DeleteSale saleId={sale._id} itemId={sale.itemId} />
                )}
              </Cell>
            </SalesRow>
          ))}
        </tbody>
      ))}
    </table>
  );
};

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
    <Card tw="max-h-full flex flex-col">
      <CardTitle>{`Ventes du ${date} (${result.data.salesCount})`}</CardTitle>
      <CardBody>
        <SalesTables carts={result.data.carts} />
      </CardBody>
    </Card>
  );
};

// padding is needed for shadow to be visible despite the overflow-auto
const Wrapper = tw.div`flex flex-1 flex-col gap-lg max-h-full overflow-auto pr-1 pb-1 -mr-1 -mb-1`;

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
    <Wrapper>
      <Title>{title}</Title>
      <div tw="flex gap-lg items-start flex-wrap">
        <Card tw="flex-1">
          <CardTitle>Répartition par TVA</CardTitle>
          <CardBody>
            <TVALoader date={date} />
          </CardBody>
        </Card>
        <Card tw="flex-1">
          <CardTitle>Répartition par type de paiement</CardTitle>
          <CardBody>
            <CategoriesLoader date={date} />
          </CardBody>
        </Card>
      </div>
      <SalesLoader date={date} />
    </Wrapper>
  );
};

export default SalesByDay;

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: await createContext(),
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
