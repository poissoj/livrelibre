import { faSpinner, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx } from "clsx";
import Link from "next/link";

import { Button } from "@/components/Button";
import { formatNumber, formatPrice, formatTVA } from "@/utils/format";
import { type RouterOutput, trpc } from "@/utils/trpc";

const DeleteSale = ({
  saleId,
  itemId,
}: {
  saleId: string;
  itemId: string | null;
}) => {
  const utils = trpc.useContext();
  const { mutate, isLoading } = trpc.deleteSale.useMutation({
    async onSuccess() {
      await utils.salesByDay.invalidate();
    },
  });
  return (
    <Button
      type="button"
      name="saleId"
      aria-label="Supprimer la vente"
      className="[background-color:#FF9800]"
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

type Carts = RouterOutput["salesByDay"]["carts"];

const SalesRow = ({
  deleted,
  children,
}: {
  deleted: boolean;
  children: React.ReactNode;
}) => <tr className={clsx(deleted && "line-through italic")}>{children}</tr>;

const TH_STYLES = "sticky top-0 bg-white";

const Cell = ({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) => (
  <td className={clsx("p-sm", className)}>{children}</td>
);

export const SalesTable = ({ carts }: { carts: Carts }) => {
  return (
    <table className="flex-1" cellPadding={8}>
      <thead>
        <tr>
          <th className={clsx(TH_STYLES, "text-right")}>Stock</th>
          <th className={clsx(TH_STYLES, "text-left")}>Titre</th>
          <th className={clsx(TH_STYLES, "text-left")}>Auteur</th>
          <th className={clsx(TH_STYLES, "text-right")}>Quantité</th>
          <th className={clsx(TH_STYLES, "text-right")}>Prix total</th>
          <th className={clsx(TH_STYLES, "text-right")}>TVA</th>
          <th className={clsx(TH_STYLES, "text-left")}>Paiement</th>
          <th className={TH_STYLES}></th>
        </tr>
      </thead>
      {carts.map((cart, i) => (
        <tbody className="odd:bg-gray-light" key={i}>
          {cart.sales.map((sale) => (
            <SalesRow key={sale._id} deleted={sale.deleted}>
              <Cell className="text-right font-number">
                {"amount" in sale ? formatNumber(sale.amount) : ""}
              </Cell>
              <Cell>
                {sale.itemId ? (
                  <Link
                    href={`/item/${sale.itemId}`}
                    passHref
                    className="text-primary-darkest"
                  >
                    {sale.title}
                  </Link>
                ) : (
                  sale.title
                )}
              </Cell>
              <Cell>{"author" in sale ? sale.author : ""}</Cell>
              <Cell className="text-right font-number">{sale.quantity}</Cell>
              <Cell className="text-right font-number">
                {formatPrice(sale.price)}
              </Cell>
              <Cell className="text-right font-number">
                {formatTVA(sale.tva)}
              </Cell>
              <Cell className="whitespace-nowrap">{sale.type}</Cell>
              <Cell className="pr-3">
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
