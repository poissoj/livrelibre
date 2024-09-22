import * as React from "react";
import { faPlus, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button, LinkButton } from "@/components/Button";
import {
  CustomerForm,
  type CustomerFormFields,
} from "@/components/CustomerForm";
import { Title } from "@/components/Title";
import { trpc } from "@/utils/trpc";

const NewCustomer = (): React.ReactElement => {
  const mutation = trpc.updateCustomer.useMutation();
  const submit = async (customer: CustomerFormFields) => {
    return await mutation.mutateAsync({ customer });
  };
  return (
    <div className="[margin-left:10%] [margin-right:10%] flex-1">
      <Title>Ajouter un client</Title>
      <CustomerForm title="Ajouter un client" onSubmit={submit}>
        <LinkButton
          href="/customers"
          className="mr-2 px-md [background-color:#6E6E6E]"
        >
          <FontAwesomeIcon icon={faTimesCircle} className="mr-sm" />
          Annuler
        </LinkButton>
        <Button type="submit" className="px-md" disabled={mutation.isLoading}>
          <FontAwesomeIcon icon={faPlus} className="mr-sm" />
          Ajouter
        </Button>
      </CustomerForm>
    </div>
  );
};

export default NewCustomer;
