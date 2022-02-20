import {
  faCheckCircle,
  faSpinner,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useState } from "react";
import ContentLoader from "react-content-loader";
import { useForm } from "react-hook-form";
import tw from "twin.macro";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Input, Select } from "@/components/FormControls";
import { Title } from "@/components/Title";
import type { PaymentFormData } from "@/server/cart";
import { formatDate } from "@/utils/date";
import { CART_ERRORS } from "@/utils/errors";
import { formatNumber, formatPrice } from "@/utils/format";
import { PAYMENT_METHODS } from "@/utils/sale";
import { trpc } from "@/utils/trpc";
import type { InferQueryOutput } from "@/utils/trpc";

const StickyTh = tw.th`sticky top-0 bg-white`;

const RemoveFromCartButton = ({ id }: { id: string }) => {
  const utils = trpc.useContext();
  const { mutate, isLoading } = trpc.useMutation("removeFromCart", {
    async onSuccess() {
      await utils.invalidateQueries("cart");
    },
  });
  return (
    <Button
      type="button"
      tw="background-color[#FF9800]"
      onClick={() => mutate(id)}
      title="Enlever du panier"
    >
      <FontAwesomeIcon
        icon={isLoading ? faSpinner : faTrashAlt}
        spin={isLoading}
      />
    </Button>
  );
};

type CartItems = InferQueryOutput<"cart">["items"];

const ItemTitle = ({ item }: { item: CartItems[number] }) => {
  if (item.itemId) {
    return (
      <span tw="text-primary-darkest">
        <Link href={`/item/${item.itemId}`}>{item.title}</Link>
      </span>
    );
  }
  return <span>{item.title}</span>;
};

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
            <ItemTitle item={item} />
          </td>
          <td tw="text-right font-number">{formatPrice(Number(item.price))}</td>
          <td tw="text-right font-number">{formatNumber(item.quantity)}</td>
          <td tw="text-right font-number">
            {formatPrice(Number(item.price) * item.quantity)}
          </td>
          <td tw="text-center">
            <RemoveFromCartButton id={item._id} />
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
    <form tw="flex justify-end gap-sm" onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="paymentDate" tw="self-center cursor-pointer">
        Date
      </label>
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
        css={[tw`width[7em] font-number`, paymentType !== "cash" && tw`hidden`]}
      />
      <Button type="submit" tw="padding[10px 15px]">
        <FontAwesomeIcon icon={faCheckCircle} />
        <span tw="ml-sm">Payer</span>
      </Button>
    </form>
  );
};

const QuickAdd = ({ addError }: { addError(error: ISBNError): void }) => {
  type FormFields = { isbn: string };
  const { register, handleSubmit, resetField } = useForm<FormFields>();
  const utils = trpc.useContext();
  const mutation = trpc.useMutation("addISBNToCart", {
    onError(error, isbn) {
      addError({ message: CART_ERRORS.INTERNAL_ERROR, isbn });
    },
    async onSuccess(data, isbn) {
      if (data) {
        addError({
          message: data.errorCode,
          isbn,
          title: data.title,
          id: data.id,
        });
        return;
      }
      await Promise.all([
        utils.invalidateQueries("cart"),
        utils.invalidateQueries("bookmarks"),
        utils.invalidateQueries("quicksearch"),
        utils.invalidateQueries("items"),
        utils.invalidateQueries("advancedSearch"),
      ]);
    },
  });
  const submit = ({ isbn }: FormFields) => {
    mutation.mutate(isbn);
    resetField("isbn");
  };
  return (
    <form tw="flex items-center" onSubmit={handleSubmit(submit)}>
      <label htmlFor="isbn-field" tw="flex-shrink-0 mr-2">
        Ajout rapide :
      </label>
      <Input
        type="text"
        placeholder="ISBN"
        maxLength={13}
        tw="w-40"
        id="isbn-field"
        autoFocus
        {...register("isbn", { minLength: 10, maxLength: 13 })}
      />
    </form>
  );
};

type ISBNError = {
  message: CART_ERRORS;
  isbn: string;
  title?: string;
  id?: string;
};

const ErrorList = ({
  errors,
  removeError,
}: {
  errors: ISBNError[];
  removeError(isbn: string): void;
}) => {
  return (
    <>
      {errors.map((error) => (
        <Alert
          type={
            error.message === CART_ERRORS.INTERNAL_ERROR ? "error" : "warning"
          }
          key={error.isbn}
          onDismiss={() => removeError(error.isbn)}
          tw="mb-1"
        >
          {error.message === CART_ERRORS.INTERNAL_ERROR
            ? `Une erreur est survenue lors de l'ajout de ${error.isbn}`
            : null}
          {error.message === CART_ERRORS.ITEM_NOT_FOUND
            ? `Aucun article trouvé pour ${error.isbn}`
            : null}
          {error.message === CART_ERRORS.NO_STOCK && error.id ? (
            <span>
              Pas de stock pour{" "}
              <Link href={`/item/${error.id}`} passHref>
                <a tw="underline">{error.title}</a>
              </Link>
            </span>
          ) : null}
        </Alert>
      ))}
    </>
  );
};

const CartLoader = () => {
  const result = trpc.useQuery(["cart"]);
  const [change, setChange] = useState<number | null>(null);
  const [errors, setErrors] = useState<ISBNError[]>([]);

  const addError = (error: ISBNError) =>
    setErrors((oldErrors) =>
      oldErrors.filter((old) => old.isbn !== error.isbn).concat(error)
    );
  const removeError = (isbn: string) =>
    setErrors((oldErrors) => oldErrors.filter((old) => old.isbn !== isbn));

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
        <div tw="flex items-center">
          <CardTitle tw="mr-auto">Panier</CardTitle>
          <QuickAdd addError={addError} />
        </div>
        <CardBody tw="flex-col">
          <ErrorList errors={errors} removeError={removeError} />
          {change && (
            <Alert type="info" tw="mb-5" onDismiss={() => setChange(null)}>
              <span>
                À rendre: <span tw="font-number">{change.toFixed(2)}</span>€
              </span>
            </Alert>
          )}
          <p>Aucun article dans le panier</p>
        </CardBody>
      </Card>
    );
  }
  return (
    <Card tw="max-h-full flex flex-col">
      <div tw="flex items-center">
        <CardTitle tw="mr-auto">
          Panier - {count} article{count > 1 ? "s" : ""}
        </CardTitle>
        <QuickAdd addError={addError} />
      </div>
      <CardBody tw="flex-col">
        <ErrorList errors={errors} removeError={removeError} />
        <CartTable items={items} />
      </CardBody>
      <CardFooter>
        <p>
          <span tw="font-medium font-size[1.1rem]">
            Total : <span tw="font-number">{formatPrice(total)}</span>
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
