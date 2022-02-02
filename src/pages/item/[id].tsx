import { useRouter } from "next/router";
import { ErrorMessage } from "@/components/ErrorMessage";
import { NoResults } from "@/components/NoResults";
import { Title } from "@/components/Title";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { trpc, useBookmark } from "@/utils/trpc";
import { ItemWithCount, ITEM_TYPES } from "@/utils/item";
import tw from "twin.macro";
import ContentLoader from "react-content-loader";
import { Button } from "@/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as emptyStar } from "@fortawesome/free-regular-svg-icons";
import dynamic from "next/dynamic";
import { createSSGHelpers } from "@trpc/react/ssg";
import { appRouter } from "@/pages/api/trpc/[trpc]";
import type { GetStaticPaths, GetStaticProps } from "next";
import { getBookmarks } from "@/server/bookmarks";
import { formatTVA } from "@/utils/tva";
import { createContext } from "@/server/context";

const SalesByMonth = dynamic(() => import("@/components/Charts/SalesByMonth"));

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
      <DD tw="font-mono">{formatPrice(item.prix_achat)}</DD>
      <DT>Prix de vente</DT>
      <DD tw="font-mono">{formatPrice(item.price)}</DD>
      <DT>Quantité</DT>
      <DD tw="font-mono">{item.amount}</DD>
      <DT>TVA</DT>
      <DD tw="font-mono">{formatTVA(item.tva)}</DD>
      <DT>Vendu</DT>
      <DD>
        <span tw="font-mono">{item.count}</span> fois
      </DD>
    </DL>
  );
};

const SkeletonRow = ({ n }: { n: number }) => (
  <>
    <rect x="2%" y={n * 35 + 5} rx="5" ry="5" width="20%" height="12" />
    <rect x="30%" y={n * 35 + 6} rx="5" ry="5" width="60%" height="10" />
  </>
);

const ItemSkeleton = () => (
  <ContentLoader height={500} width="100%" uniqueKey="item-skeleton">
    {Array(14)
      .fill(0)
      .map((_, i) => (
        <SkeletonRow key={i} n={i} />
      ))}
  </ContentLoader>
);

const TitleWithButtons = ({ item }: { item: ItemWithCount }) => {
  const { star, mutation } = useBookmark();
  const handleClick = () => star(item._id, !item.starred);

  return (
    <div tw="flex items-center">
      <CardTitle tw="mr-auto">{item.title}</CardTitle>
      <Button
        type="button"
        title={item.starred ? "Enlever des favoris" : "Ajouter aux favoris"}
        onClick={handleClick}
        tw="width[32px]"
      >
        <FontAwesomeIcon
          icon={
            mutation.isLoading ? faSpinner : item.starred ? faStar : emptyStar
          }
          spin={mutation.isLoading}
        />
      </Button>
    </div>
  );
};

const ItemLoader = ({ id }: { id: string }) => {
  const result = trpc.useQuery(["searchItem", id]);

  if (result.status === "error") {
    return (
      <Card tw="flex-1">
        <CardTitle>Article en erreur</CardTitle>
        <CardBody>
          <ErrorMessage />
        </CardBody>
      </Card>
    );
  }
  if (result.status === "success") {
    return result.data ? (
      <Card tw="flex-1">
        <Title>{`${result.data.title} | Voir un article`}</Title>
        <TitleWithButtons item={result.data} />
        <CardBody>
          <ItemDetails item={result.data} />
        </CardBody>
      </Card>
    ) : (
      <Card tw="flex-1">
        <CardTitle>Article introuvable</CardTitle>
        <CardBody>
          <NoResults />
        </CardBody>
      </Card>
    );
  }
  return (
    <Card tw="flex-1">
      <CardTitle>Chargement…</CardTitle>
      <CardBody>
        <ItemSkeleton />
      </CardBody>
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
      <Card tw="flex-1">
        <CardTitle>Article introuvable</CardTitle>
        <CardBody>
          <NoResults />
        </CardBody>
      </Card>
    );
  }
  return <ItemLoader id={id} />;
};

const SalesSkeleton = () => (
  <ContentLoader height={350} width="100%" uniqueKey="item-sales-skeleton">
    <rect x="2%" y={119} width="4%" height={196} />
    <rect x="8%" y={83} width="4%" height={232} />
    <rect x="26%" y={160} width="4%" height={155} />
    <rect x="50%" y={238} width="4%" height={77} />
    <rect x="74%" y={276} width="4%" height={39} />
    <rect x="80%" y={119} width="4%" height={196} />
    <rect x="86%" y={109} width="4%" height={206} />
    <rect x="92%" y={160} width="4%" height={155} />
  </ContentLoader>
);

const Sales = ({ id }: { id: string }) => {
  const result = trpc.useQuery(["lastSales", id]);
  if (result.status === "error") {
    return <ErrorMessage />;
  }
  if (result.status === "loading" || result.status === "idle") {
    return <SalesSkeleton />;
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
    <Card tw="mb-lg">
      <CardTitle>Ventes des 2 dernières années</CardTitle>
      <CardBody>
        <Sales id={id} />
      </CardBody>
    </Card>
  );
};

const ItemPage = (): JSX.Element => (
  <div tw="flex items-start gap-lg flex-1 flex-wrap">
    <Title>Voir un article</Title>
    <ItemCard />
    <div tw="flex flex-col gap-lg flex-1">
      <SalesCard />
    </div>
  </div>
);

export default ItemPage;

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: await createContext(),
  });
  const id = context.params?.id;
  if (typeof id === "string") {
    await Promise.all([
      ssg.fetchQuery("searchItem", id),
      ssg.fetchQuery("lastSales", id),
    ]);
  }
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 1,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const bookmarks = await getBookmarks();
  const paths = bookmarks.map((bookmark) => ({ params: { id: bookmark._id } }));
  return { paths, fallback: "blocking" };
};
