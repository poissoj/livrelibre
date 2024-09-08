import * as React from "react";
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type NextRouter, useRouter } from "next/router";
import ContentLoader from "react-content-loader";
import { toast } from "react-toastify";

import { Button, LinkButton } from "@/components/Button";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { ErrorMessage } from "@/components/ErrorMessage";
import { OrderForm } from "@/components/OrderForm";
import { Title } from "@/components/Title";
import { type RawOrder, deserializeOrder } from "@/utils/order";
import { trpc } from "@/utils/trpc";

const CARD_TITLE = "Modifier une commande";

const SkeletonRow = ({ n }: { n: number }) => (
  <>
    <rect x="5%" y={n * 50} rx="2" ry="2" width="12%" height="30" />
    <rect x="20%" y={n * 50} rx="2" ry="2" width="30%" height="30" />
  </>
);

const OrderFormSkeleton = (): React.ReactElement => (
  <ContentLoader height={300} width="100%">
    {Array(4)
      .fill(0)
      .map((_, i) => (
        <SkeletonRow key={i} n={i} />
      ))}
  </ContentLoader>
);

const getOrdersURL = (router: NextRouter) => {
  const { orderId, ...query } = router.query;
  return { pathname: "/orders", query };
};

const DeleteOrder = ({ id }: { id: number }) => {
  const router = useRouter();
  const deleteMutation = trpc.deleteOrder.useMutation();
  const deleteOrder = async () => {
    const res = await deleteMutation.mutateAsync({ id });
    if (res.type === "success") {
      toast.success(res.msg);
      await router.push(getOrdersURL(router));
    } else {
      toast.error(res.msg);
    }
  };

  return (
    <ConfirmationDialog
      title="Supprimer une commande"
      message="Êtes-vous sûr⋅e de vouloir supprimer cette commande ? Cette action ne peut pas être annulée."
      onConfirm={deleteOrder}
    />
  );
};

const OrderLoader = ({ id }: { id: number }) => {
  const result = trpc.order.useQuery(id);
  const utils = trpc.useUtils();
  const router = useRouter();
  const mutation = trpc.updateOrder.useMutation({
    async onSuccess(data) {
      if (data.type === "success") {
        await utils.order.invalidate();
        toast.success(data.msg);
        void router.push(getOrdersURL(router));
      } else {
        toast.error(data.msg);
      }
    },
  });

  const submit = async (order: RawOrder) => {
    return await mutation.mutateAsync({ order, id });
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
          <OrderFormSkeleton />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <OrderForm
        title={CARD_TITLE}
        onSubmit={submit}
        data={{
          ...deserializeOrder(result.data),
        }}
      >
        <DeleteOrder id={id} />
        <LinkButton
          href={getOrdersURL(router)}
          className="mr-2 px-md [background-color:#6E6E6E]"
        >
          <FontAwesomeIcon icon={faTimesCircle} className="mr-sm" />
          Annuler
        </LinkButton>
        <Button type="submit" className="px-md">
          <FontAwesomeIcon icon={faCheckCircle} className="mr-sm" />
          Modifier
        </Button>
      </OrderForm>
    </div>
  );
};

const UpdateOrder = () => {
  const router = useRouter();
  const { orderId } = router.query;
  if (typeof orderId !== "string") {
    return null;
  }
  return (
    <div className="flex-1 max-w-6xl mx-auto">
      <Title>Modifier une commande</Title>
      <OrderLoader id={Number(orderId)} />
    </div>
  );
};

export default UpdateOrder;
