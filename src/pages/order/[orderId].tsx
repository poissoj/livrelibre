import * as React from "react";
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import ContentLoader from "react-content-loader";

import { Button, LinkButton } from "@/components/Button";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { OrderForm } from "@/components/OrderForm";
import { Title } from "@/components/Title";
import { type Order, deserializeOrder } from "@/utils/order";
import { trpc } from "@/utils/trpc";

const CARD_TITLE = "Modifier une commande";

const SkeletonRow = ({ n }: { n: number }) => (
  <>
    <rect x="5%" y={n * 50} rx="2" ry="2" width="12%" height="30" />
    <rect x="20%" y={n * 50} rx="2" ry="2" width="30%" height="30" />
  </>
);

const OrderFormSkeleton = (): JSX.Element => (
  <ContentLoader height={300} width="100%">
    {Array(4)
      .fill(0)
      .map((_, i) => (
        <SkeletonRow key={i} n={i} />
      ))}
  </ContentLoader>
);

const OrderLoader = ({ id }: { id: string }) => {
  const result = trpc.order.useQuery(id);
  const utils = trpc.useUtils();
  const mutation = trpc.updateOrder.useMutation({
    async onSuccess() {
      await utils.order.invalidate();
    },
  });
  const router = useRouter();

  const submit = async (data: Order) => {
    const order = { ...data, date: data.date.toISOString() };
    return await mutation.mutateAsync({ order, id });
  };

  const onSuccess = () => {
    void router.push(`/orders?status=updated`);
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
        data={deserializeOrder(result.data)}
        onSuccess={onSuccess}
      >
        <LinkButton
          href="/orders"
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
    <div className="2xl:([margin-left:10%] [margin-right:10%]) flex-1">
      <Title>Modifier une commande</Title>
      <OrderLoader id={orderId} />
    </div>
  );
};

export default UpdateOrder;
