import * as React from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

import { Button } from "@/components/Button";
import { OrderForm } from "@/components/OrderForm";
import { Title } from "@/components/Title";
import type { Order } from "@/utils/order";
import { trpc } from "@/utils/trpc";

const NewOrder = (): JSX.Element => {
  const router = useRouter();
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
  const submit = async (data: Order) => {
    const order = { ...data, date: data.date.toISOString() };
    return await mutation.mutateAsync(order);
  };
  return (
    <div className="[margin-left:10%] [margin-right:10%] flex-1">
      <Title>Nouvelle commande</Title>
      <OrderForm title="Nouvelle commande" onSubmit={submit}>
        <Button type="submit" className="px-md">
          <FontAwesomeIcon icon={faPlus} className="mr-sm" />
          Ajouter
        </Button>
      </OrderForm>
    </div>
  );
};

export default NewOrder;
