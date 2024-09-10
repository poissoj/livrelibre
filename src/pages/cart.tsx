import {
  faCheckCircle,
  faEdit,
  faHourglassStart,
  faShareSquare,
  faSpinner,
  faTimesCircle,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx } from "clsx";
import Link from "next/link";
import { type FormEvent, type ReactElement, useState } from "react";
import ContentLoader from "react-content-loader";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { Alert } from "@/components/Alert";
import { Button, LinkButton } from "@/components/Button";
import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Input, Select } from "@/components/FormControls";
import { SelectCustomer } from "@/components/SelectCustomer";
import { Title } from "@/components/Title";
import type { PaymentFormData } from "@/server/cart";
import type { Customer, CustomerWithPurchase } from "@/utils/customer";
import { formatDate } from "@/utils/date";
import { CART_ERRORS } from "@/utils/errors";
import { formatNumber, formatPrice } from "@/utils/format";
import { PAYMENT_METHODS } from "@/utils/sale";
import { trpc } from "@/utils/trpc";
import type { RouterOutput } from "@/utils/trpc";

const TH_STYLES = "sticky top-0 bg-white";

const RemoveFromCartButton = ({ id }: { id: number }) => {
  const utils = trpc.useUtils();
  const { mutate, isLoading } = trpc.removeFromCart.useMutation({
    async onSuccess() {
      await utils.cart.invalidate();
    },
  });
  return (
    <Button
      type="button"
      className="[background-color:#FF9800]"
      onClick={() => {
        mutate(id);
      }}
      title="Enlever du panier"
    >
      <FontAwesomeIcon
        icon={isLoading ? faSpinner : faTrashAlt}
        spin={isLoading}
      />
    </Button>
  );
};

type CartItems = RouterOutput["cart"]["items"];

const ItemTitle = ({ item }: { item: CartItems[number] }) => {
  if (item.itemId) {
    return (
      <span className="text-primary-darkest">
        <Link href={`/item/${item.itemId}`} legacyBehavior>
          {item.title}
        </Link>
      </span>
    );
  }
  return <span>{item.title}</span>;
};

const CartTable = ({ items }: { items: CartItems }) => (
  <table className="flex-1 border-separate [border-spacing:2px_0.5rem]">
    <thead>
      <tr>
        <th className={clsx(TH_STYLES, "text-left")}>Article</th>
        <th className={clsx(TH_STYLES, "text-right")}>Prix unitaire</th>
        <th className={clsx(TH_STYLES, "text-right")}>Quantité</th>
        <th className={clsx(TH_STYLES, "text-right")}>Prix total</th>
        <th className={TH_STYLES}></th>
      </tr>
    </thead>
    <tbody>
      {items.map((item) => (
        <tr key={item.id}>
          <td>
            <ItemTitle item={item} />
          </td>
          <td className="text-right font-number">
            {formatPrice(Number(item.price))}
          </td>
          <td className="text-right font-number">
            {formatNumber(item.quantity)}
          </td>
          <td className="text-right font-number">
            {formatPrice(Number(item.price) * item.quantity)}
          </td>
          <td className="text-center">
            <RemoveFromCartButton id={item.id} />
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

const ItemsSkeleton = (): ReactElement => (
  <ContentLoader height={150} width="100%">
    {Array(5)
      .fill(0)
      .map((_, i) => (
        <SkeletonRow key={i} n={i} />
      ))}
  </ContentLoader>
);

const usePayCart = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.payCart.useMutation({
    onSuccess() {
      void utils.cart.invalidate();
      void utils.customers.invalidate();
      void utils.selectedCustomer.invalidate();
      void utils.searchCustomer.invalidate();
    },
    onError() {
      toast.error("Impossible de valider le panier");
    },
  });
  return mutation;
};

const PaymentForm = ({ cb }: { cb: (amount: number | null) => void }) => {
  const { register, handleSubmit, watch } = useForm<PaymentFormData>({
    defaultValues: {
      paymentDate: formatDate(new Date()),
      paymentType: "cash",
    },
  });
  const mutation = usePayCart();
  const onSubmit = async (data: PaymentFormData) => {
    const res = await mutation.mutateAsync(data);
    cb(res.change);
  };
  const paymentType = watch("paymentType");
  return (
    <form className="flex justify-end gap-sm" onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="paymentDate" className="self-center cursor-pointer">
        Date
      </label>
      <Input
        id="paymentDate"
        type="date"
        {...register("paymentDate")}
        className="w-min"
      />
      <Select {...register("paymentType")} className="w-min">
        {Object.entries(PAYMENT_METHODS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <label
        htmlFor="cash"
        className={clsx("sr-only", { hidden: paymentType !== "cash" })}
      >
        Espèces
      </label>
      <Input
        id="cash"
        type="number"
        {...register("amount")}
        step={0.01}
        min={0}
        className={clsx("!w-28 font-number", {
          hidden: paymentType !== "cash",
        })}
      />
      <Button type="submit" className="[padding:10px_15px]">
        <FontAwesomeIcon icon={faCheckCircle} />
        <span className="ml-sm">Payer</span>
      </Button>
    </form>
  );
};

const QuickAdd = ({ addError }: { addError: (error: ISBNError) => void }) => {
  type FormFields = { isbn: string };
  const { register, handleSubmit, resetField } = useForm<FormFields>();
  const utils = trpc.useUtils();
  const mutation = trpc.addISBNToCart.useMutation({
    onError(error, isbn) {
      addError({ message: CART_ERRORS.INTERNAL_ERROR, isbn });
    },
    async onSuccess(data, isbn) {
      if (data.errorCode) {
        const { errorCode: message, ...rest } = data;
        addError({
          message,
          isbn,
          ...rest,
        });
        return;
      }
      await Promise.all([
        utils.cart.invalidate(),
        utils.bookmarks.invalidate(),
        utils.quicksearch.invalidate(),
        utils.items.invalidate(),
        utils.advancedSearch.invalidate(),
      ]);
    },
  });
  const submit = ({ isbn }: FormFields) => {
    if (!isbn) return;
    mutation.mutate(isbn);
    resetField("isbn");
  };
  return (
    <form className="flex items-center" onSubmit={handleSubmit(submit)}>
      <label htmlFor="isbn-field" className="flex-shrink-0 mr-2">
        Ajout rapide :
      </label>
      <Input
        type="text"
        placeholder="ISBN"
        maxLength={13}
        className="!w-40"
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
  title?: string | undefined;
  id?: number | undefined;
};

const ErrorList = ({
  errors,
  removeError,
}: {
  errors: ISBNError[];
  removeError: (isbn: string) => void;
}) => {
  return (
    <>
      {errors.map((error) => (
        <Alert
          type={
            error.message === CART_ERRORS.INTERNAL_ERROR ? "error" : "warning"
          }
          key={error.isbn}
          onDismiss={() => {
            removeError(error.isbn);
          }}
          className="mb-1"
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
              <Link href={`/item/${error.id}`} className="underline">
                {error.title}
              </Link>
            </span>
          ) : null}
        </Alert>
      ))}
    </>
  );
};

const AsideButton = () => {
  const { handleSubmit } = useForm();
  const utils = trpc.useUtils();
  const asideCart = trpc.asideCart.useQuery();
  const { mutateAsync, isLoading } = trpc.putCartAside.useMutation({
    async onSuccess() {
      await Promise.all([
        utils.cart.invalidate(),
        utils.asideCart.invalidate(),
      ]);
    },
  });
  const submit = async () => {
    await mutateAsync();
  };

  if (asideCart.status !== "success") {
    return null;
  }
  return (
    <form onSubmit={handleSubmit(submit)}>
      <Button
        type="submit"
        className="[padding:10px_15px]"
        value="put-aside"
        disabled={isLoading || asideCart.data.count > 0}
      >
        <FontAwesomeIcon
          icon={isLoading ? faSpinner : faHourglassStart}
          spin={isLoading}
        />
        <span className="ml-sm">Mettre de côté</span>
      </Button>
    </form>
  );
};

const AsideCartWrapper = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Card>
      <CardTitle>Panier en attente</CardTitle>
      <CardBody>{children}</CardBody>
    </Card>
  );
};

const ReactivateButton = () => {
  const { handleSubmit } = useForm();
  const cart = trpc.cart.useQuery();

  const utils = trpc.useUtils();
  const { mutateAsync, isLoading } = trpc.reactivateCart.useMutation({
    async onSuccess() {
      await Promise.all([
        utils.cart.invalidate(),
        utils.asideCart.invalidate(),
      ]);
    },
  });

  if (cart.status !== "success") {
    return null;
  }
  const submit = async () => {
    await mutateAsync();
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Button
        type="submit"
        className="[padding:10px_15px] mb-2"
        disabled={cart.data.count > 0 || isLoading}
      >
        <FontAwesomeIcon
          icon={isLoading ? faSpinner : faShareSquare}
          spin={isLoading}
        />
        <span className="ml-sm">Réactiver</span>
      </Button>
    </form>
  );
};

const AsideCartLoader = () => {
  const result = trpc.asideCart.useQuery();
  if (result.status === "error") {
    return (
      <AsideCartWrapper>
        <ErrorMessage />
      </AsideCartWrapper>
    );
  }
  if (result.status === "loading") {
    return null;
  }
  const { count, total } = result.data;
  if (count === 0) {
    return null;
  }
  const plural = count > 1 ? "s" : "";
  return (
    <AsideCartWrapper>
      <div className="flex flex-1 justify-between">
        <p>
          <span className="font-number">{count}</span> article{plural} en
          attente pour
          <span className="font-number ml-2">{formatPrice(total)}</span>
        </p>
        <ReactivateButton />
      </div>
    </AsideCartWrapper>
  );
};

const CustomerInfos = ({ customer }: { customer: CustomerWithPurchase }) => {
  const amount = customer.purchases.reduce((s, p) => s + p.amount, 0);
  const [discount, setDiscount] = useState(Math.round(amount * 3) / 100);
  const [applied, setApplied] = useState<number>();

  const utils = trpc.useUtils();
  const { mutateAsync, isLoading } = trpc.addNewItemToCart.useMutation({
    async onSuccess() {
      await utils.cart.invalidate();
    },
    onError() {
      toast.error("Impossible de faire la remise");
    },
  });
  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setApplied(discount);
    await mutateAsync({
      price: String(-discount),
      title: "Remise carte de fidélité",
      type: "book",
      tva: "5.5",
    });
  };

  return (
    <div>
      {customer.comment ? <div>{customer.comment}</div> : null}
      <div>
        {customer.purchases.length} achat
        {customer.purchases.length > 1 ? "s" : ""}, total {formatPrice(amount)}
      </div>
      {applied === undefined ? (
        <form onSubmit={onSubmit}>
          Remise possible:
          <Input
            type="number"
            step={0.01}
            min={0}
            className="ml-2 !w-28 font-number"
            value={discount}
            onChange={(e) => {
              setDiscount(Number(e.target.value));
            }}
          />
          <Button type="submit" className="ml-2" disabled={isLoading}>
            Appliquer
          </Button>
        </form>
      ) : (
        <div>Remise de {formatPrice(applied)} appliquée</div>
      )}
    </div>
  );
};

const CustomerSelector = () => {
  const result = trpc.selectedCustomer.useQuery();
  const utils = trpc.useUtils();
  const { mutateAsync } = trpc.selectCustomer.useMutation({
    async onSuccess() {
      await utils.selectedCustomer.invalidate();
    },
    onError() {
      toast.error("Impossible de faire la remise");
    },
  });

  const onSelect = (selectedCustomer: Customer | null) => {
    void mutateAsync({
      asideCart: false,
      customerId: selectedCustomer?.id ?? null,
    });
  };

  if (!result.isSuccess) {
    return null;
  }

  const customer = result.data;

  return (
    <>
      <div className="flex gap-1">
        <SelectCustomer
          customer={customer}
          setCustomer={onSelect}
          placeholder="Associer un⋅e client⋅e…"
        />
        {customer && (
          <>
            <LinkButton href={`/customer/${customer.id}`} title="Modifier">
              <FontAwesomeIcon icon={faEdit} />
            </LinkButton>
            <Button
              type="button"
              title="Dissocier"
              onClick={() => {
                onSelect(null);
              }}
            >
              <FontAwesomeIcon icon={faTimesCircle} />
            </Button>
          </>
        )}
      </div>
      {customer && <CustomerInfos customer={customer} />}
    </>
  );
};

const CartLoader = () => {
  const result = trpc.cart.useQuery();
  const [change, setChange] = useState<number | null>(null);
  const [errors, setErrors] = useState<ISBNError[]>([]);

  const addError = (error: ISBNError) => {
    setErrors((oldErrors) =>
      oldErrors.filter((old) => old.isbn !== error.isbn).concat(error),
    );
  };
  const removeError = (isbn: string) => {
    setErrors((oldErrors) => oldErrors.filter((old) => old.isbn !== isbn));
  };

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
  const { count, total, items } = result.data;
  if (count === 0) {
    return (
      <>
        <Card>
          <div className="flex items-center">
            <CardTitle className="mr-auto">Panier</CardTitle>
            <QuickAdd addError={addError} />
          </div>
          <CardBody className="flex-col">
            <ErrorList errors={errors} removeError={removeError} />
            {change && (
              <Alert
                type="info"
                className="mb-5"
                onDismiss={() => {
                  setChange(null);
                }}
              >
                <span>
                  À rendre:{" "}
                  <span className="font-number">{change.toFixed(2)}</span>€
                </span>
              </Alert>
            )}
            <p>Aucun article dans le panier</p>
          </CardBody>
        </Card>
        <AsideCartLoader />
      </>
    );
  }
  return (
    <>
      <Card className="max-h-full flex flex-col">
        <div className="flex items-center">
          <CardTitle className="mr-auto">
            Panier - {count} article{count > 1 ? "s" : ""}
          </CardTitle>
          <QuickAdd addError={addError} />
        </div>
        <CustomerSelector />
        <CardBody className="flex-col">
          <ErrorList errors={errors} removeError={removeError} />
          <CartTable items={items} />
        </CardBody>
        <CardFooter>
          <p className="mb-2">
            <span className="font-medium [font-size:1.1rem]">
              Total : <span className="font-number">{formatPrice(total)}</span>
            </span>
          </p>
          <div className="flex justify-between">
            <AsideButton />
            <PaymentForm cb={setChange} />
          </div>
        </CardFooter>
      </Card>
      <AsideCartLoader />
    </>
  );
};

const CartPage = () => {
  return (
    <div className="[margin-left:10%] [margin-right:10%] flex-1 flex flex-col gap-6">
      <Title>Panier</Title>
      <CartLoader />
    </div>
  );
};

export default CartPage;
