import * as React from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

import { Button } from "@/components/Button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { OrderForm } from "@/components/OrderForm";
import { Title } from "@/components/Title";
import type { RawOrder } from "@/utils/order";
import { trpc } from "@/utils/trpc";

const OrderBody = () => {
  const router = useRouter();
  const rawId = router.query.item;
  const id = typeof rawId === "string" ? rawId : "";
  const result = trpc.searchItem.useQuery(Number(id), { enabled: id !== "" });
  const mutation = trpc.newOrder.useMutation({
    onSuccess(data) {
      if (data.type === "success") {
        toast.success(data.msg);
        void router.push("/orders");
      } else {
        toast.error(data.msg);
      }
    },
    onError() {
      toast.error("Impossible d'ajouter la commande");
    },
  });

  const submit = async (order: RawOrder) => {
    return await mutation.mutateAsync(order);
  };
  if (result.status === "error") {
    return <ErrorMessage />;
  }
  if (result.status === "loading" && id) {
    return <div>Chargement…</div>;
  }
  const data: React.ComponentProps<typeof OrderForm>["data"] = {
    item: result.data || null,
    nb: 1,
    created: new Date(),
  };
  return (
    <OrderForm title="Nouvelle commande" onSubmit={submit} data={data}>
      <Button type="submit" className="px-md">
        <FontAwesomeIcon icon={faPlus} className="mr-sm" />
        Ajouter
      </Button>
    </OrderForm>
  );
};

const NewOrder = (): JSX.Element => {
  return (
    <div className="flex-1 max-w-6xl mx-auto">
      <Title>Nouvelle commande</Title>
      <OrderBody />
    </div>
  );
};

export default NewOrder;
