import * as React from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "twin.macro";

import { Button } from "@/components/Button";
import { type FormFields, ItemForm } from "@/components/ItemForm";
import { Title } from "@/components/Title";
import { trpc } from "@/utils/trpc";

const Add = (): JSX.Element => {
  const mutation = trpc.addItem.useMutation();
  const submit = async (data: FormFields) => {
    const datebought = data.datebought.split("-").reverse().join("/");
    const item = { ...data, amount: Number(data.amount), datebought };
    return await mutation.mutateAsync(item);
  };
  return (
    <div tw="[margin-left:10%] [margin-right:10%] flex-1">
      <Title>Ajouter un article</Title>
      <ItemForm title="Ajouter un article" onSubmit={submit}>
        <Button type="submit" tw="px-md">
          <FontAwesomeIcon icon={faPlus} tw="mr-sm" />
          Ajouter
        </Button>
      </ItemForm>
    </div>
  );
};

export default Add;
