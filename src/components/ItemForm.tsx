import * as React from "react";
import { faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

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
import { formatTVA } from "@/utils/format";
import type { BookData } from "@/utils/getBookData";
import { type BaseItem, ITEM_TYPES, TVAValues } from "@/utils/item";

export type FormFields = Omit<BaseItem, "amount"> & { amount: string };

type TAlert = {
  type: React.ComponentProps<typeof Alert>["type"];
  message: string;
};

const Column = ({ children }: React.PropsWithChildren) => (
  <div className="flex-1 [min-width:20rem] ml-md">{children}</div>
);

const ISBNSearchButton = ({
  clickHandler,
  isLoading,
}: {
  clickHandler: () => Promise<void>;
  isLoading: boolean;
}) => {
  return (
    <ButtonWithInput
      type="button"
      aria-label="Chercher les infos pour cet ISBN"
      onClick={clickHandler}
    >
      <FontAwesomeIcon
        icon={isLoading ? faSpinner : faSearch}
        spin={isLoading}
        className="mx-sm"
      />
    </ButtonWithInput>
  );
};

export const ItemForm = ({
  title,
  onSubmit,
  data,
  children,
  onSuccess,
}: {
  title: string;
  onSubmit: (
    data: FormFields,
  ) => Promise<{ type: "error" | "success" | "warning"; msg: string }>;
  data?: FormFields;
  onSuccess?: () => void;
  children: React.ReactNode;
}): React.ReactElement => {
  const { register, handleSubmit, reset, getValues, setValue } =
    useForm<FormFields>({
      defaultValues: data || {},
    });
  const [alert, setAlert] = React.useState<TAlert | null>(null);
  const [isbnLoading, setIsbnLoading] = React.useState(false);
  const form = React.useRef<HTMLFormElement>(null);

  const submit = async () => {
    const data = Object.fromEntries(
      new FormData(form.current ?? undefined).entries(),
    ) as FormFields;
    const { type, msg: message } = await onSubmit(data);
    setAlert({ type, message });
    if (type === "success") {
      if (onSuccess) {
        onSuccess();
      } else {
        reset();
      }
    }
  };

  const isbnSearch = async () => {
    const isbn = getValues("isbn");
    if (!isbn || !/^\d{10,13}$/.test(isbn)) return;
    const response = await fetch(`/api/book/${isbn}`);
    if (!response.ok) {
      throw new Error(String(response.status));
    }
    const data = (await response.json()) as BookData;
    setValue("title", data.title);
    setValue("author", data.author);
    setValue("publisher", data.publisher);
  };

  const isbnHandler = async () => {
    setIsbnLoading(true);
    try {
      await isbnSearch();
    } catch (error) {
      if (error instanceof Error && error.message === "404") {
        toast.warn("Aucun résultat pour cet ISBN");
      } else {
        toast.error("Impossible de récupérer les données");
      }
    } finally {
      setIsbnLoading(false);
    }
  };

  const onKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || isbnLoading) {
      return;
    }
    event.preventDefault();
    await isbnHandler();
  };

  return (
    <Card className="max-h-full flex flex-col">
      <CardTitle>{title}</CardTitle>
      <form
        className="flex-1 flex flex-col h-0"
        onSubmit={handleSubmit(submit)}
        ref={form}
      >
        <CardBody className="flex-col gap-5">
          <div className="flex flex-wrap">
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
                  onKeyDown={onKeyDown}
                  {...register("isbn")}
                />
                <ISBNSearchButton
                  clickHandler={isbnHandler}
                  isLoading={isbnLoading}
                />
              </FormRow>
              <FormRow label="Auteur·ice">
                <Input type="text" {...register("author")} />
              </FormRow>
              <FormRow label="Titre">
                <Input type="text" {...register("title")} required />
              </FormRow>
              <FormRow label="Maison d'édition">
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
              <FormRow label="Prix de vente">
                <Input
                  type="number"
                  {...register("price")}
                  step={0.01}
                  required
                  className="font-number"
                />
              </FormRow>
              <FormRow label="Quantité">
                <Input
                  type="number"
                  {...register("amount")}
                  min={0}
                  defaultValue={0}
                  className="font-number"
                />
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
            </Column>
          </div>
        </CardBody>
        <CardFooter>
          <div className="flex justify-end mb-sm">{children}</div>
          {alert ? (
            <Alert
              type={alert.type}
              onDismiss={() => {
                setAlert(null);
              }}
            >
              {alert.message}
            </Alert>
          ) : null}
        </CardFooter>
      </form>
    </Card>
  );
};
