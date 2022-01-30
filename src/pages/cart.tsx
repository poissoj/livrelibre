import tw from "twin.macro";
import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import { Title } from "@/components/Title";
import Link from "next/link";
import { trpc } from "@/utils/trpc";
import { ErrorMessage } from "@/components/ErrorMessage";
import ContentLoader from "react-content-loader";
import { Button } from "@/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import type { InferQueryOutput } from "@/utils/trpc";
import { Input, Select } from "@/components/FormControls";
import { formatDate } from "@/utils/date";
import { PAYMENT_METHODS } from "@/utils/sale";
import { useForm } from "react-hook-form";
import type { PaymentFormData } from "@/server/cart";
import { useState } from "react";
import { Alert } from "@/components/Alert";

const StickyTh = tw.th`sticky top-0 bg-white`;

type CartItems = InferQueryOutput<"cart">["items"];

const CartTable = ({ items }: { items: CartItems }) => (
  <table tw="flex-1 border-separate border-spacing[2px 0.5rem]">
    <thead>
      <tr>
        <StickyTh tw="text-left">Article</StickyTh>
        <StickyTh tw="text-right">Prix unitaire</StickyTh>
        <StickyTh tw="text-right">Quantité</StickyTh>
        <StickyTh tw="text-right">Prix total</StickyTh>
        <StickyTh></StickyTh>
      </tr>
    </thead>
    <tbody>
      {items.map((item, i) => (
        <tr key={i}>
          <td>
            <span tw="text-primary-darkest">
              <Link href={`/item/${item.itemId}`}>{item.title}</Link>
            </span>
          </td>
          <td tw="text-right font-mono">{Number(item.price).toFixed(2)}€</td>
          <td tw="text-right font-mono">{item.quantity}</td>
          <td tw="text-right font-mono">
            {(Number(item.price) * item.quantity).toFixed(2)}€
          </td>
          <td tw="text-center">
            <Button tw="background-color[#FF9800]">
              <FontAwesomeIcon icon={faTrashAlt} />
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const SkeletonRow = ({ n }: { n: number }) => (
  <>
    <rect x="2%" y={n * 30} rx="2" ry="2" width="25%" height="10" />
    <rect x="32%" y={n * 30} rx="2" ry="2" width="25%" height="10" />
    <rect x="62%" y={n * 30} rx="2" ry="2" width="25%" height="10" />
    <rect x="92%" y={n * 30} rx="2" ry="2" width="6%" height="10" />
  </>
);

const ItemsSkeleton = (): JSX.Element => (
  <ContentLoader height={150} width="100%">
    {Array(5)
      .fill(0)
      .map((_, i) => (
        <SkeletonRow key={i} n={i} />
      ))}
  </ContentLoader>
);

const usePayCart = () => {
  const utils = trpc.useContext();
  const mutation = trpc.useMutation("payCart", {
    onSuccess() {
      void utils.invalidateQueries("cart");
    },
  });
  return mutation;
};

const PaymentForm = ({ cb }: { cb: (amount: number | null) => void }) => {
  const { register, handleSubmit, watch } = useForm<PaymentFormData>();
  const mutation = usePayCart();
  const onSubmit = async (data: PaymentFormData) => {
    const res = await mutation.mutateAsync(data);
    cb(res.change);
  };
  const paymentType = watch("paymentType");
  return (
    <form
      tw="flex justify-end items-center gap-sm"
      onSubmit={handleSubmit(onSubmit)}
    >
      <label htmlFor="paymentDate">Date</label>
      <Input
        id="paymentDate"
        type="date"
        {...register("paymentDate")}
        tw="w-min"
        defaultValue={formatDate(new Date())}
      />
      <Select {...register("paymentType")} tw="w-min" defaultValue="cash">
        {Object.entries(PAYMENT_METHODS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <label
        htmlFor="cash"
        css={[tw`sr-only`, paymentType !== "cash" && tw`hidden`]}
      >
        Espèces
      </label>
      <Input
        id="cash"
        type="number"
        {...register("amount")}
        step={0.01}
        min={0}
        css={[tw`width[7em] font-mono`, paymentType !== "cash" && tw`hidden`]}
      />
      <Button type="submit" tw="padding[10px 15px]">
        <FontAwesomeIcon icon={faCheckCircle} />
        <span tw="ml-sm">Payer</span>
      </Button>
    </form>
  );
};

const CartLoader = () => {
  const result = trpc.useQuery(["cart"]);
  const [change, setChange] = useState<number | null>(null);
  if (result.status === "error") {
    return (
      <Card>
        <CardTitle>Panier</CardTitle>
        <CardBody>
          <ErrorMessage />
        </CardBody>
      </Card>
    );
  }
  if (result.status === "loading") {
    return (
      <Card>
        <CardTitle>Panier</CardTitle>
        <CardBody>
          <ItemsSkeleton />
        </CardBody>
      </Card>
    );
  }
  if (result.status === "idle") {
    return (
      <Card>
        <CardTitle>Panier</CardTitle>
      </Card>
    );
  }
  const { count, total, items } = result.data;
  if (count === 0) {
    return (
      <Card>
        <CardTitle>Panier</CardTitle>
        <CardBody tw="flex-col">
          {change && (
            <Alert type="info" tw="mb-5" onDismiss={() => setChange(null)}>
              <span>
                À rendre: <span tw="font-mono">{change.toFixed(2)}</span>€
              </span>
            </Alert>
          )}
          <p>Aucun article dans le panier</p>
        </CardBody>
      </Card>
    );
  }
  return (
    <Card>
      <CardTitle>
        Panier - {count} article{count > 1 ? "s" : ""}
      </CardTitle>
      <CardBody>
        <CartTable items={items} />
      </CardBody>
      <CardFooter>
        <p>
          <span tw="font-medium font-size[1.1rem]">
            Total : <span tw="font-mono">{total.toFixed(2)}€</span>
          </span>
        </p>
        <PaymentForm cb={setChange} />
      </CardFooter>
    </Card>
  );
};

const CartPage = () => {
  return (
    <div tw="margin-left[10%] margin-right[10%] flex-1">
      <Title>Panier</Title>
      <CartLoader />
    </div>
  );
};

export default CartPage;
