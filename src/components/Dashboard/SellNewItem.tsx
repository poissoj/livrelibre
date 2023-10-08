import * as React from "react";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm } from "react-hook-form";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { Input, Select } from "@/components/FormControls";
import { FormRow } from "@/components/FormRow";
import type { NewCartItem } from "@/server/cart";
import { formatTVA } from "@/utils/format";
import { ITEM_TYPES, TVAValues } from "@/utils/item";
import { trpc } from "@/utils/trpc";

type TAlert = {
  type: React.ComponentProps<typeof Alert>["type"];
  message: string;
};

export const SellNewItem = (): JSX.Element => {
  const { register, handleSubmit, reset } = useForm<NewCartItem>();
  const utils = trpc.useContext();
  const [alert, setAlert] = React.useState<TAlert | null>(null);
  const { mutateAsync, isLoading } = trpc.addNewItemToCart.useMutation({
    async onSuccess() {
      await utils.cart.invalidate();
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
    <Card className="mb-lg">
      <CardTitle>Vendre un article non répertorié</CardTitle>
      <CardBody className="flex-col gap-4">
        <form
          className="flex flex-col flex-1"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormRow label="Prix">
            <Input
              type="number"
              {...register("price")}
              className="font-number"
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
            <Select
              {...register("tva")}
              defaultValue="5.5"
              className="font-number"
            >
              {TVAValues.map((value) => (
                <option value={value} key={value}>
                  {formatTVA(value)}
                </option>
              ))}
            </Select>
          </FormRow>
          <Button type="submit" className="self-center" disabled={isLoading}>
            <FontAwesomeIcon icon={faCartPlus} className="mr-sm" />
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
