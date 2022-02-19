import { faStar as emptyStar } from "@fortawesome/free-regular-svg-icons";
import {
  faCartPlus,
  faEdit,
  faSpinner,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createSSGHelpers } from "@trpc/react/ssg";
import type { GetStaticPaths, GetStaticProps } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import ContentLoader from "react-content-loader";
import { useForm } from "react-hook-form";
import tw from "twin.macro";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Input } from "@/components/FormControls";
import { NoResults } from "@/components/NoResults";
import { Title } from "@/components/Title";
import { appRouter } from "@/pages/api/trpc/[trpc]";
import { getBookmarks } from "@/server/bookmarks";
import { createContext } from "@/server/context";
import { formatNumber, formatPrice, formatTVA } from "@/utils/format";
import { ITEM_TYPES, ItemWithCount } from "@/utils/item";
import { trpc, useBookmark } from "@/utils/trpc";
import { useAddToCart } from "@/utils/useAddToCart";

const SalesByMonth = dynamic(() => import("@/components/Charts/SalesByMonth"));

const DL = tw.dl`flex flex-wrap min-width[24rem]`;
const DT = tw.dt`flex-basis[30%] p-sm font-medium`;
const DD = tw.dd`flex[1 0 70%] p-sm`;

const formatStringPrice = (price: string) =>
  price ? formatPrice(Number(price)) : "";

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
      <DD tw="font-number">{formatStringPrice(item.prix_achat)}</DD>
      <DT>Prix de vente</DT>
      <DD tw="font-number">{formatStringPrice(item.price)}</DD>
      <DT>Quantité</DT>
      <DD tw="font-number">{formatNumber(item.amount)}</DD>
      <DT>TVA</DT>
      <DD tw="font-number">{formatTVA(item.tva)}</DD>
      <DT>Vendu</DT>
      <DD>
        <span tw="font-number">{formatNumber(item.count)}</span> fois
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
        tw="border-top-right-radius[0] border-bottom-right-radius[0] px-md border-r border-primary-darkest"
      >
        <FontAwesomeIcon
          icon={
            mutation.isLoading ? faSpinner : item.starred ? faStar : emptyStar
          }
          spin={mutation.isLoading}
        />
      </Button>
      <Link href={`/update/${item._id}`} passHref>
        <Button
          as="a"
          title="Modifier"
          tw="border-top-left-radius[0] border-bottom-left-radius[0] px-md"
        >
          <FontAwesomeIcon icon={faEdit} />
        </Button>
      </Link>
    </div>
  );
};

const AddToCartFooter = ({ id, stock }: { id: string; stock: number }) => {
  type FormFields = { quantity: string };
  const { register, handleSubmit } = useForm<FormFields>();
  const { mutate, isLoading } = useAddToCart();
  const utils = trpc.useContext();
  const submit = ({ quantity }: FormFields) => {
    mutate(
      { id, quantity: Number(quantity) },
      {
        async onSuccess() {
          await utils.invalidateQueries("searchItem");
        },
      }
    );
  };
  return (
    <form tw="flex justify-end" onSubmit={handleSubmit(submit)}>
      <label>
        <span tw="font-medium mr-2">Quantité</span>
        <Input
          type="number"
          {...register("quantity")}
          min={1}
          max={stock}
          step={1}
          tw="font-number w-20"
          defaultValue={1}
        />
      </label>
      <Button type="submit" tw="ml-2 px-md" disabled={stock === 0}>
        <FontAwesomeIcon
          icon={isLoading ? faSpinner : faCartPlus}
          spin={isLoading}
          tw="mr-2"
        />
        Ajouter au panier
      </Button>
    </form>
  );
};

const StatusMessage = ({ itemTitle }: { itemTitle: string }) => {
  const router = useRouter();
  const { status, id } = router.query;
  if (status === "updated" && typeof id === "string") {
    return (
      <Alert type="success" onDismiss={() => router.push(`/item/${id}`)}>
        {itemTitle} modifié.
      </Alert>
    );
  }
  return null;
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
      <Card tw="flex-1 max-h-full flex flex-col">
        <Title>{`${result.data.title} | Voir un article`}</Title>
        <TitleWithButtons item={result.data} />
        <CardBody tw="flex-col">
          <StatusMessage itemTitle={result.data.title} />
          <ItemDetails item={result.data} />
        </CardBody>
        <CardFooter>
          <AddToCartFooter id={id} stock={result.data.amount} />
        </CardFooter>
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
