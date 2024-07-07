import * as React from "react";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { LinkButton } from "@/components/Button";
import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import { Input, Select, Textarea } from "@/components/FormControls";
import { FormRow } from "@/components/FormRow";
import { SelectCustomer } from "@/components/SelectCustomer";
import { type NewItem, SelectItem } from "@/components/SelectItem";
import type { Customer } from "@/utils/customer";
import { toInputDate } from "@/utils/date";
import type { Item } from "@/utils/item";
import { type Order, STATUS_LABEL } from "@/utils/order";
import { trpc } from "@/utils/trpc";

type InputOrder = Omit<Order, "date"> & { date: string };

export const OrderForm = ({
  title,
  onSubmit,
  data,
  children,
}: {
  title: string;
  onSubmit(data?: Order): Promise<{ type: "error" | "success"; msg: string }>;
  data?: Order;
  children: React.ReactNode;
}): JSX.Element => {
  const defaultValues = data
    ? { ...data, date: toInputDate(data.date) }
    : { date: toInputDate(new Date()), nb: 1 };
  const { register, handleSubmit, reset, setValue } = useForm<InputOrder>({
    defaultValues,
    shouldUseNativeValidation: true,
  });
  const [customer, setCustomer] = React.useState<Customer | null>(
    data?.customer ?? null,
  );
  const [item, setItem] = React.useState<Item | NewItem | null>(
    data?.item ?? { _id: null, title: data?.itemTitle ?? "" },
  );
  const utils = trpc.useUtils();

  const submit = async (data: InputOrder) => {
    const order = {
      ...data,
      itemId: data.itemId || undefined,
      date: new Date(data.date),
    };
    if (order.item?.isbn && !order.itemId) {
      const result = await utils.isbnSearch.fetch(order.item.isbn);
      if (result.count === 0) {
        toast.info("Aucun article trouvé pour cet ISBN");
      }
      updateItem(result.items[0]);
      return;
    }
    if (!order.itemTitle) {
      toast.info("Merci de renseigner le titre ou l'ISBN de l'article");
      return;
    }
    const { type } = await onSubmit(order);
    if (type !== "success") {
      reset();
    }
  };

  const updateCustomer = (customer: Customer | null) => {
    setCustomer(customer);
    setValue("customerId", customer?._id ?? "");
  };

  const updateItem = (item: Item | NewItem | null) => {
    setItem(item);
    setValue("itemId", item?._id ?? "");
    setValue("itemTitle", item?.title ?? "");
  };

  return (
    <Card className="max-h-full flex flex-col">
      <CardTitle>{title}</CardTitle>
      <form
        className="flex-1 flex flex-col h-0"
        onSubmit={handleSubmit(submit)}
      >
        <CardBody className="flex-col gap-5">
          <div className="flex flex-wrap flex-col">
            <FormRow label="Client⋅e">
              <SelectCustomer
                customer={customer}
                setCustomer={updateCustomer}
                fullWidth
                required
              />
              <LinkButton
                href="/customer/new"
                className="ml-sm self-center"
                title="Nouveau client"
              >
                <FontAwesomeIcon icon={faUserPlus} />
              </LinkButton>
            </FormRow>
            <FormRow label="Date">
              <Input type="datetime-local" {...register("date")} />
            </FormRow>
            <FormRow label="ISBN">
              <Input
                {...register("item.isbn", {
                  validate: (isbn: string | null) =>
                    !isbn || /^\d{10,13}$/.test(isbn) || "ISBN invalide",
                })}
              />
            </FormRow>
            <FormRow label="Titre">
              <SelectItem item={item} setItem={updateItem} fullWidth />
            </FormRow>
            <FormRow label="Commentaires">
              <Textarea {...register("comment")} />
            </FormRow>
            <FormRow label="Nb d'exemplaires">
              <Input
                type="number"
                min="1"
                {...register("nb", { valueAsNumber: true })}
              />
            </FormRow>
            <FormRow label="État">
              <Select {...register("ordered")} defaultValue="new">
                {Object.entries(STATUS_LABEL).map(([key, label]) => (
                  <option value={key} key={key}>
                    {label}
                  </option>
                ))}
              </Select>
            </FormRow>
            <FormRow label="Payé">
              <input type="checkbox" {...register("paid")} />
            </FormRow>
            <FormRow label="Client⋅e informé⋅e">
              <input type="checkbox" {...register("customerNotified")} />
            </FormRow>
          </div>
        </CardBody>
        <CardFooter>
          <div className="flex justify-end mb-sm">{children}</div>
        </CardFooter>
      </form>
    </Card>
  );
};
