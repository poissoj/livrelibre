import * as React from "react";
import { faPlus, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";

import { Button, LinkButton } from "@/components/Button";
import { OrderForm, type OrderFormFields } from "@/components/OrderForm";
import { Title } from "@/components/Title";
import { trpc } from "@/utils/trpc";

const NewOrder = (): JSX.Element => {
  const mutation = trpc.newOrder.useMutation({
    onError() {
      toast.error("Impossible d'ajouter la commande");
    },
  });
  const submit = async (order: OrderFormFields) => {
    return await mutation.mutateAsync(order);
  };
  return (
    <div className="[margin-left:10%] [margin-right:10%] flex-1">
      <Title>Nouvelle commande</Title>
      <OrderForm title="Nouvelle commande" onSubmit={submit}>
        <LinkButton
          href="/orders"
          className="mr-2 px-md [background-color:#6E6E6E]"
        >
          <FontAwesomeIcon icon={faTimesCircle} className="mr-sm" />
          Annuler
        </LinkButton>
        <Button type="submit" className="px-md">
          <FontAwesomeIcon icon={faPlus} className="mr-sm" />
          Ajouter
        </Button>
      </OrderForm>
    </div>
  );
};

export default NewOrder;
