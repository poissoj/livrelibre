import * as React from "react";
import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Title } from "@/components/Title";
import { FormRow } from "@/components/FormRow";
import {
  Input,
  InputWithButton,
  Select,
  Textarea,
} from "@/components/FormControls";
import { Button, ButtonWithInput } from "@/components/Button";
import tw from "twin.macro";
import { faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import { BaseItem, ITEM_TYPES } from "@/utils/item";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/Alert";
import { trpc } from "@/utils/trpc";
import { formatDate } from "@/utils/date";

const Column = tw.div`flex-1 min-width[20rem] ml-md`;

type TAlert = {
  type: React.ComponentProps<typeof Alert>["type"];
  message: string;
};

type FormData = Omit<BaseItem, "amount"> & { amount: string };

const Add = (): JSX.Element => {
  const { register, handleSubmit } = useForm<FormData>();
  const [alert, setAlert] = React.useState<TAlert | null>(null);
  const mutation = trpc.useMutation("addItem");
  const onSubmit = async (data: FormData) => {
    const datebought = data.datebought.split("-").reverse().join("/");
    const item = { ...data, amount: Number(data.amount), datebought };
    const res = await mutation.mutateAsync(item);
    setAlert({
      type: res.type,
      message: res.msg,
    });
  };
  return (
    <div tw="margin-left[10%] margin-right[10%] flex-1">
      <Title>Ajouter un article</Title>
      <Card tw="mb-lg">
        <CardTitle>Ajouter un article</CardTitle>
        <form tw="flex-1" onSubmit={handleSubmit(onSubmit)}>
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
                  <Select
                    {...register("tva")}
                    defaultValue="5.5"
                    tw="font-mono"
                  >
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
            <div tw="flex justify-end mb-sm">
              <Button type="submit" tw="px-md">
                <FontAwesomeIcon icon={faPlus} tw="mr-sm" />
                Ajouter
              </Button>
            </div>
            {alert ? (
              <Alert type={alert.type} onDismiss={() => setAlert(null)}>
                {alert.message}
              </Alert>
            ) : null}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Add;
