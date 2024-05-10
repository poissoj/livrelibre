import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { Alert } from "@/components/Alert";
import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import { Input, Select, Textarea } from "@/components/FormControls";
import { FormRow } from "@/components/FormRow";
import { SelectCustomer } from "@/components/SelectCustomer";
import { type NewItem, SelectItem } from "@/components/SelectItem";
import type { Customer } from "@/utils/customer";
import type { Item } from "@/utils/item";
import { type Order, STATUS_LABEL } from "@/utils/order";
import { trpc } from "@/utils/trpc";

type TAlert = {
  type: React.ComponentProps<typeof Alert>["type"];
  message: string;
};

export const OrderForm = ({
  title,
  onSubmit,
  data,
  children,
  onSuccess,
}: {
  title: string;
  onSubmit(data?: Order): Promise<{ type: "error" | "success"; msg: string }>;
  data?: Order;
  onSuccess?(): void;
  children: React.ReactNode;
}): JSX.Element => {
  const { register, handleSubmit, reset, setValue } = useForm<Order>({
    defaultValues: data || {},
    shouldUseNativeValidation: true,
  });
  const [alert, setAlert] = React.useState<TAlert | null>(null);
  const [customer, setCustomer] = React.useState<Customer | null>(
    data?.customer ?? null,
  );
  const [item, setItem] = React.useState<Item | NewItem | null>(
    data?.item ?? { _id: null, title: data?.itemTitle ?? "" },
  );
  const utils = trpc.useUtils();

  const submit = async (data: Order) => {
    const order = data.itemId ? data : { ...data, itemId: undefined }; // Fix case itemId === ""
    if (order.item?.isbn && !order.itemId) {
      const result = await utils.isbnSearch.fetch(order.item.isbn);
      if (result.count === 0) {
        toast.info("Aucun article trouvé pour cet ISBN");
      }
      updateItem(result.items[0]);
      return;
    }
    if (!order.itemTitle) {
      return;
    }
    const { type, msg: message } = await onSubmit(order);
    setAlert({ type, message });
    if (type === "success") {
      onSuccess ? onSuccess() : reset();
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
