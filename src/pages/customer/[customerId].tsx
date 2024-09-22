import * as React from "react";
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/router";
import ContentLoader from "react-content-loader";
import { toast } from "react-toastify";

import { Button, LinkButton } from "@/components/Button";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import {
  CustomerForm,
  type CustomerFormFields,
} from "@/components/CustomerForm";
import { ErrorMessage } from "@/components/ErrorMessage";
import { StatusCircle } from "@/components/StatusCircle";
import { Title } from "@/components/Title";
import type { CustomerWithPurchase } from "@/utils/customer";
import { formatPrice } from "@/utils/format";
import { trpc } from "@/utils/trpc";

const CARD_TITLE = "Modifier un⋅e client⋅e";

const SkeletonRow = ({ n }: { n: number }) => (
  <>
    <rect x="5%" y={n * 50} rx="2" ry="2" width="12%" height="30" />
    <rect x="20%" y={n * 50} rx="2" ry="2" width="30%" height="30" />
  </>
);

const CustomerFormSkeleton = (): React.ReactElement => (
  <ContentLoader height={300} width="100%">
    {Array(4)
      .fill(0)
      .map((_, i) => (
        <SkeletonRow key={i} n={i} />
      ))}
  </ContentLoader>
);

const OrdersContent = ({ customerId }: { customerId: number }) => {
  const [orders] = trpc.customerOrders.useSuspenseQuery(customerId);
  return (
    <>
      <CardTitle>{`Commandes en cours: ${orders.length}`}</CardTitle>
      <CardBody>
        {orders.length === 0 ? (
          "Aucune commande en cours pour ce⋅tte client⋅e"
        ) : (
          <ul>
            {orders.map((order) => (
              <li key={order.id} className="mb-1">
                <Link
                  href={`/order/${order.id}`}
                  className="flex gap-2 items-center"
                >
                  <StatusCircle status={order.ordered} />
                  {order.itemTitle}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </>
  );
};

const Orders = ({ customerId }: { customerId: number }) => {
  return (
    <Card className="flex-1">
      <React.Suspense fallback={<CardBody>Chargement…</CardBody>}>
        <OrdersContent customerId={customerId} />
      </React.Suspense>
    </Card>
  );
};

const Purchases = ({ purchases }: Pick<CustomerWithPurchase, "purchases">) => {
  const total = purchases.reduce((s, p) => s + p.amount, 0);
  return (
    <Card className="flex-1">
      <CardTitle>Détail des achats</CardTitle>
      <CardBody className="flex-col">
        {purchases.length > 0 ? (
          <>
            <div className="mb-2">
              {purchases.length} achat{purchases.length > 1 ? "s" : ""} pour un
              total de {formatPrice(total)}
            </div>
            <table className="w-fit border-separate border-spacing-x-4 border-spacing-y-1">
              <thead>
                <tr>
                  <th className="text-left">Date</th>
                  <th className="text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase, i) => (
                  <tr key={i}>
                    <td>{purchase.date}</td>
                    <td className="text-right font-number">
                      {formatPrice(purchase.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <span>Aucun achat pour ce⋅tte client⋅e</span>
        )}
      </CardBody>
    </Card>
  );
};

const DeleteCustomerButton = ({ id }: { id: number }) => {
  const deleteMutation = trpc.deleteCustomer.useMutation();
  const router = useRouter();
  const deleteCustomer = async () => {
    const res = await deleteMutation.mutateAsync({ id });
    if (res.type === "success") {
      toast.success(res.msg);
      await router.push("/customers");
    } else {
      toast.error(res.msg);
    }
  };

  return (
    <ConfirmationDialog
      title="Supprimer un⋅e client⋅e"
      message="Êtes-vous sûr⋅e de vouloir supprimer ce⋅tte client⋅e ? Cette action ne peut pas être annulée."
      onConfirm={deleteCustomer}
    />
  );
};

const CustomerLoader = ({ id }: { id: number }) => {
  const result = trpc.customer.useQuery(id);
  const utils = trpc.useUtils();
  const mutation = trpc.updateCustomer.useMutation({
    async onSuccess() {
      await utils.customer.invalidate();
    },
  });

  const submit = async (customer: CustomerFormFields) => {
    return await mutation.mutateAsync({ customer, customerId: id });
  };

  const onSuccess = () => {
    // do nothing
  };

  if (result.status === "error") {
    return (
      <Card>
        <CardTitle>{CARD_TITLE}</CardTitle>
        <CardBody>
          <ErrorMessage />
        </CardBody>
      </Card>
    );
  }

  if (result.data == null) {
    return (
      <Card>
        <CardTitle>{CARD_TITLE}</CardTitle>
        <CardBody>
          <CustomerFormSkeleton />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 mb-lg">
      <CustomerForm
        title={CARD_TITLE}
        onSubmit={submit}
        data={result.data}
        onSuccess={onSuccess}
      >
        <DeleteCustomerButton id={id} />
        <LinkButton
          href="/customers"
          className="mr-2 px-md [background-color:#6E6E6E]"
        >
          <FontAwesomeIcon icon={faTimesCircle} className="mr-sm" />
          Annuler
        </LinkButton>
        <Button type="submit" className="px-md" disabled={mutation.isLoading}>
          <FontAwesomeIcon icon={faCheckCircle} className="mr-sm" />
          Modifier
        </Button>
      </CustomerForm>
      <div className="flex-grow flex gap-4">
        <Purchases purchases={result.data.purchases} />
        <Orders customerId={id} />
      </div>
    </div>
  );
};

const UpdateCustomer = () => {
  const router = useRouter();
  const { customerId } = router.query;
  if (typeof customerId !== "string") {
    return null;
  }
  return (
    <div className="2xl:([margin-left:10%] [margin-right:10%]) flex-1">
      <Title>Modifier un client</Title>
      <CustomerLoader id={Number(customerId)} />
    </div>
  );
};

export default UpdateCustomer;
