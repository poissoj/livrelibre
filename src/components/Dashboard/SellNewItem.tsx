import * as React from "react";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@/components/Button";
import { Input, Select } from "@/components/FormControls";
import { FormRow } from "@/components/FormRow";
import "twin.macro";
import { ITEM_TYPES } from "@/utils/item";
import { useForm } from "react-hook-form";
import type { NewCartItem } from "@/server/cart";
import { trpc } from "@/utils/trpc";
import { Alert } from "@/components/Alert";

type TAlert = {
  type: React.ComponentProps<typeof Alert>["type"];
  message: string;
};

export const SellNewItem = (): JSX.Element => {
  const { register, handleSubmit, reset } = useForm<NewCartItem>();
  const utils = trpc.useContext();
  const [alert, setAlert] = React.useState<TAlert | null>(null);
  const { mutateAsync, isLoading } = trpc.useMutation("addNewItemToCart", {
    async onSuccess() {
      await utils.invalidateQueries("cart");
    },
    onError() {
      setAlert({ type: "error", message: "Impossible d'ajouter au panier" });
    },
  });
  const onSubmit = async (data: NewCartItem) => {
    await mutateAsync(data);
    reset();
    setAlert({ type: "success", message: "Article ajouté au panier" });
  };

  return (
    <Card tw="mb-lg">
      <CardTitle>Vendre un article non répertorié</CardTitle>
      <CardBody tw="flex-col gap-4">
        <form tw="flex flex-col flex-1" onSubmit={handleSubmit(onSubmit)}>
          <FormRow label="Prix">
            <Input
              type="number"
              {...register("price")}
              tw="font-mono"
              step={0.01}
              required
            />
          </FormRow>
          <FormRow label="Titre">
            <Input
              type="text"
              {...register("title")}
              placeholder="Article indépendant"
            />
          </FormRow>
          <FormRow label="Type">
            <Select {...register("type")} defaultValue="book">
              {Object.entries(ITEM_TYPES).map(([key, label]) => (
                <option value={key} key={key}>
                  {label}
                </option>
              ))}
            </Select>
          </FormRow>
          <FormRow label="TVA">
            <Select {...register("tva")} defaultValue="5.5">
              <option value="20">20.0%</option>
              <option value="5.5">5.5%</option>
              <option value="2.1">2.1%</option>
              <option value="0">0.0%</option>
            </Select>
          </FormRow>
          <Button type="submit" tw="self-center" disabled={isLoading}>
            <FontAwesomeIcon icon={faCartPlus} tw="mr-sm" />
            Ajouter au panier
          </Button>
        </form>
        {alert ? (
          <Alert type={alert.type} onDismiss={() => setAlert(null)}>
            {alert.message}
          </Alert>
        ) : null}
      </CardBody>
    </Card>
  );
};
