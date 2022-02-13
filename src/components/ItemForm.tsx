import * as React from "react";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm } from "react-hook-form";
import tw from "twin.macro";

import { Alert } from "@/components/Alert";
import { ButtonWithInput } from "@/components/Button";
import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import {
  Input,
  InputWithButton,
  Select,
  Textarea,
} from "@/components/FormControls";
import { FormRow } from "@/components/FormRow";
import { formatDate } from "@/utils/date";
import { BaseItem, ITEM_TYPES } from "@/utils/item";

export type FormFields = Omit<BaseItem, "amount"> & { amount: string };

type TAlert = {
  type: React.ComponentProps<typeof Alert>["type"];
  message: string;
};

const Column = tw.div`flex-1 min-width[20rem] ml-md`;

export const ItemForm = ({
  title,
  onSubmit,
  data,
  children,
  onSuccess,
}: {
  title: string;
  onSubmit(
    data?: FormFields
  ): Promise<{ type: "error" | "success" | "warning"; msg: string }>;
  data?: FormFields;
  onSuccess?(): void;
  children: React.ReactNode;
}): JSX.Element => {
  const { register, handleSubmit, reset } = useForm<FormFields>({
    defaultValues: data,
  });
  const [alert, setAlert] = React.useState<TAlert | null>(null);
  const submit = async (data: FormFields) => {
    const { type, msg: message } = await onSubmit(data);
    setAlert({ type, message });
    if (type === "success") {
      onSuccess ? onSuccess() : reset();
    }
  };
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <form tw="flex-1" onSubmit={handleSubmit(submit)}>
        <CardBody tw="flex-col gap-5">
          <div tw="flex flex-wrap">
            <Column>
              <FormRow label="Type">
                <Select defaultValue="book" {...register("type")}>
                  {Object.entries(ITEM_TYPES).map(([key, label]) => (
                    <option value={key} key={key}>
                      {label}
                    </option>
                  ))}
                </Select>
              </FormRow>
              <FormRow label="ISBN">
                <InputWithButton
                  type="text"
                  maxLength={13}
                  {...register("isbn")}
                />
                <ButtonWithInput
                  type="button"
                  aria-label="Chercher les infos pour cet ISBN"
                >
                  <FontAwesomeIcon icon={faSearch} tw="mx-sm" />
                </ButtonWithInput>
              </FormRow>
              <FormRow label="Auteur">
                <Input type="text" {...register("author")} />
              </FormRow>
              <FormRow label="Titre">
                <Input type="text" {...register("title")} required />
              </FormRow>
              <FormRow label="Éditeur">
                <Input type="text" {...register("publisher")} />
              </FormRow>
              <FormRow label="Distributeur">
                <Input type="text" {...register("distributor")} />
              </FormRow>
              <FormRow label="Mots-clés">
                <Input type="text" {...register("keywords")} />
              </FormRow>
            </Column>
            <Column>
              <FormRow label="Date d&rsquo;achat">
                <Input
                  type="date"
                  {...register("datebought")}
                  defaultValue={formatDate(new Date())}
                />
              </FormRow>
              <FormRow label="Commentaires">
                <Textarea {...register("comments")} />
              </FormRow>
              <FormRow label="Prix d&rsquo;achat">
                <Input
                  type="number"
                  {...register("prix_achat")}
                  min={0}
                  step={0.01}
                  tw="font-mono"
                />
              </FormRow>
              <FormRow label="Prix de vente">
                <Input
                  type="number"
                  {...register("price")}
                  step={0.01}
                  required
                  tw="font-mono"
                />
              </FormRow>
              <FormRow label="Quantité">
                <Input
                  type="number"
                  {...register("amount")}
                  min={0}
                  defaultValue={1}
                  tw="font-mono"
                />
              </FormRow>
              <FormRow label="TVA">
                <Select {...register("tva")} defaultValue="5.5" tw="font-mono">
                  <option value="20">20.0%</option>
                  <option value="5.5">5.5%</option>
                  <option value="2.1">2.1%</option>
                  <option value="0">0.0%</option>
                </Select>
              </FormRow>
            </Column>
          </div>
        </CardBody>
        <CardFooter>
          <div tw="flex justify-end mb-sm">{children}</div>
          {alert ? (
            <Alert type={alert.type} onDismiss={() => setAlert(null)}>
              {alert.message}
            </Alert>
          ) : null}
        </CardFooter>
      </form>
    </Card>
  );
};