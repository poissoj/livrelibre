import * as React from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "@/components/Button";
import { type FormFields, ItemForm } from "@/components/ItemForm";
import { Title } from "@/components/Title";
import { trpc } from "@/utils/trpc";

const Add = (): React.ReactElement => {
  const mutation = trpc.addItem.useMutation();
  const submit = async (data: FormFields) => {
    const datebought = data.datebought.split("-").reverse().join("/");
    const item = { ...data, amount: Number(data.amount), datebought };
    return await mutation.mutateAsync(item);
  };
  return (
    <div className="[margin-left:10%] [margin-right:10%] flex-1">
      <Title>Ajouter un article</Title>
      <ItemForm title="Ajouter un article" onSubmit={submit}>
        <Button type="submit" className="px-md" disabled={mutation.isLoading}>
          <FontAwesomeIcon icon={faPlus} className="mr-sm" />
          Ajouter
        </Button>
      </ItemForm>
    </div>
  );
};

export default Add;
