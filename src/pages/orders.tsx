import { faCheck, faFilter, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import clsx from "clsx";
import { useRouter } from "next/router";
import React from "react";

import { LinkButton } from "@/components/Button";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { COMMON_STYLES_BASE, Input } from "@/components/FormControls";
import { ItemsCard } from "@/components/ItemsCard";
import { OrdersTable } from "@/components/OrdersTable";
import { StatusCircle } from "@/components/StatusCircle";
import { Title } from "@/components/Title";
import {
  ORDER_STATUS,
  type Order,
  type OrderStatus,
  STATUS_LABEL,
  deserializeOrder,
  zOrderStatus,
  zOrderStatusArray,
} from "@/utils/order";
import { trpc } from "@/utils/trpc";
import { norm } from "@/utils/utils";

const getStatus = (query: string | string[] | undefined): OrderStatus[] => {
  const statusList = zOrderStatusArray.safeParse(query);
  if (statusList.success) {
    return statusList.data;
  }
  const status = zOrderStatus.safeParse(query);
  if (status.success) {
    return [status.data];
  }
  return ["new", "received", "unavailable", "other", "canceled"];
};

const OrdersLoader = () => {
  const router = useRouter();
  const orderStatus = getStatus(router.query.status);
  const result = trpc.orders.useQuery(orderStatus);
  const setOrderStatus = (status: OrderStatus[]) => {
    void router.push({ query: { ...router.query, status } });
  };

  const pageTitle = "Liste des commandes";
  if (result.status === "error") {
    return (
      <ItemsCard title={pageTitle}>
        <ErrorMessage />
      </ItemsCard>
    );
  }

  const items: Order[] =
    result.status === "loading" ? [] : result.data.map(deserializeOrder);

  const cardTitle =
    result.status === "loading"
      ? "Chargement"
      : `${items.length} commande${items.length > 1 ? "s" : ""}`;

  return (
    <Card className="max-h-full overflow-hidden flex flex-col relative">
      <Title>{pageTitle}</Title>
      <CardTitle className="flex items-center">
        {cardTitle}
        <LinkButton href="/order/new" className="ml-auto">
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Nouvelle commande
        </LinkButton>
      </CardTitle>
      <CardBody className="flex-col">
        <OrdersBody orders={items}>
          <Listbox multiple value={orderStatus} onChange={setOrderStatus}>
            <ListboxButton className={clsx(COMMON_STYLES_BASE, "relative")}>
              États
              <FontAwesomeIcon icon={faFilter} className="ml-2" />
            </ListboxButton>
            <Transition
              leave="transition ease-out duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions
                anchor="bottom end"
                className="border border-[#ccc] rounded-xl bg-white p-2 focus:outline-none shadow-lg"
              >
                {ORDER_STATUS.map((status) => (
                  <ListboxOption
                    key={status}
                    value={status}
                    className="flex gap-2 items-center p-1 group data-[focus]:bg-gray-light"
                  >
                    <StatusCircle status={status} />
                    <span className="opacity-80 group-data-[selected]:opacity-100">
                      {STATUS_LABEL[status]}
                    </span>
                    <FontAwesomeIcon
                      icon={faCheck}
                      className="ml-auto invisible group-data-[selected]:visible"
                    />
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Transition>
          </Listbox>
        </OrdersBody>
      </CardBody>
    </Card>
  );
};

const OrdersBody = ({
  orders,
  children,
}: React.PropsWithChildren<{ orders: Order[] }>) => {
  const router = useRouter();
  const search =
    typeof router.query.search === "string" ? router.query.search : "";
  const filteredOrders =
    search === ""
      ? orders
      : orders.filter(
          (order) =>
            order.customer.nmFullname.toLowerCase().includes(norm(search)) ||
            order.item?.isbn.includes(search) ||
            norm(order.itemTitle.toLowerCase()).includes(norm(search)),
        );
  return (
    <>
      <div className="flex justify-between">
        <Input
          defaultValue={search}
          onChange={(e) => {
            void router.push({
              query: { ...router.query, search: e.target.value.toLowerCase() },
            });
          }}
          className="text-base mb-2 !w-[30rem] h-fit"
          placeholder="Nom, prénom, titre, ISBN"
        />
        {children}
      </div>
      <div className="overflow-auto flex mt-2">
        <OrdersTable items={filteredOrders} />
      </div>
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
