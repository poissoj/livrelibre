import { faSpinner, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import tw from "twin.macro";

import { Button } from "@/components/Button";
import { formatPrice, formatTVA } from "@/utils/format";
import { InferQueryOutput, trpc } from "@/utils/trpc";

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

const StickyTh = tw.th`sticky top-0 bg-white`;

const Cell = tw.td`p-sm`;

export const SalesTable = ({ carts }: { carts: Carts }) => {
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
              <Cell tw="text-right font-number">{sale.quantity}</Cell>
              <Cell tw="text-right font-number">{formatPrice(sale.price)}</Cell>
              <Cell tw="text-right font-number">{formatTVA(sale.tva)}</Cell>
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
