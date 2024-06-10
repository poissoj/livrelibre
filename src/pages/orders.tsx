import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import React, { useState } from "react";
import ContentLoader from "react-content-loader";

import { Alert } from "@/components/Alert";
import { LinkButton } from "@/components/Button";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Input } from "@/components/FormControls";
import { ItemsCard } from "@/components/ItemsCard";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { OrdersTable } from "@/components/OrdersTable";
import { Title } from "@/components/Title";
import { type Order, deserializeOrder } from "@/utils/order";
import { trpc } from "@/utils/trpc";
import { norm } from "@/utils/utils";

const SkeletonRow = ({ n }: { n: number }) => (
  <>
    <rect x="2%" y={n * 30 + 15} rx="2" ry="2" width="25%" height="10" />
    <rect x="32%" y={n * 30 + 15} rx="2" ry="2" width="25%" height="10" />
    <rect x="62%" y={n * 30 + 15} rx="2" ry="2" width="25%" height="10" />
    <rect x="92%" y={n * 30 + 15} rx="2" ry="2" width="6%" height="10" />
  </>
);

const ItemsSkeleton = (): JSX.Element => (
  <ContentLoader height={300} width="100%">
    {Array(10)
      .fill(0)
      .map((_, i) => (
        <SkeletonRow key={i} n={i} />
      ))}
  </ContentLoader>
);

const StatusMessage = () => {
  const router = useRouter();
  const { status } = router.query;
  if (status === "updated") {
    return (
      <Alert
        type="success"
        onDismiss={() => router.push("/orders")}
        className="mb-2"
      >
        La commande a été modifiée.
      </Alert>
    );
  }
  return null;
};

const OrdersLoader = () => {
  const result = trpc.orders.useQuery();

  const pageTitle = "Liste des commandes";
  if (result.status === "error") {
    return (
      <ItemsCard title={pageTitle}>
        <ErrorMessage />
      </ItemsCard>
    );
  }
  if (result.status === "loading") {
    return (
      <ItemsCard title={pageTitle}>
        <ItemsSkeleton />
      </ItemsCard>
    );
  }
  const items: Order[] = result.data.map(deserializeOrder);
  const Wrapper = result.isFetching ? LoadingOverlay : React.Fragment;

  return (
    <Card className="max-h-full overflow-hidden flex flex-col relative">
      <Title>{pageTitle}</Title>
      <CardTitle className="flex items-center">
        {`${items.length} commande${items.length > 1 ? "s" : ""}`}
        <LinkButton href="/order/new" className="ml-auto">
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Nouvelle commande
        </LinkButton>
      </CardTitle>
      <CardBody className="flex-col">
        <StatusMessage />
        <Wrapper>
          <OrdersBody orders={items} />
        </Wrapper>
      </CardBody>
    </Card>
  );
};

const OrdersBody = ({ orders }: { orders: Order[] }) => {
  const [search, setSearch] = useState("");
  const filteredOrders =
    search === ""
      ? orders
      : orders.filter(
          (order) =>
            order.customer.nmFullname.toLowerCase().includes(norm(search)) ||
            norm(order.itemTitle.toLowerCase()).includes(norm(search)),
        );
  return (
    <>
      <Input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value.toLowerCase());
        }}
        className="text-base mb-2 !w-[30rem]"
        placeholder="Nom, prénom, titre"
      />
      <OrdersTable items={filteredOrders} />
    </>
  );
};

const Orders = (): JSX.Element => {
  return (
    <div className="flex flex-1 flex-col gap-lg">
      <Title>Liste des commandes</Title>
      <OrdersLoader />
    </div>
  );
};

export default Orders;
