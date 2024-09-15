import * as React from "react";
import {
  faAt,
  faPhone,
  faUserPlus,
  faWalking,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
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
import { type ContactMean, type RawOrder, STATUS_LABEL } from "@/utils/order";
import { trpc } from "@/utils/trpc";

const ContactMean = React.forwardRef<
  HTMLInputElement,
  React.PropsWithChildren<
    React.JSX.IntrinsicElements["input"] & {
      mean: ContactMean;
      isActive: boolean;
    }
  >
>(function ContactMean(props, ref) {
  const { mean, isActive, children, ...rest } = props;
  return (
    <>
      <input
        id={"radio-" + mean}
        type="radio"
        ref={ref}
        {...rest}
        value={mean}
        className="hidden"
      />
      <label
        htmlFor={"radio-" + mean}
        className={clsx(
          "rounded px-3 py-2 fault focus:outline-none border-2 cursor-pointer",
          "[transition:border-color_ease-in-out_0.15s]",
          { grow: mean === "mail" },
          { "basis-40": mean === "phone" },
          isActive ? "border-primary-default" : "[border-color:#ccc]",
        )}
      >
        {children}
      </label>
    </>
  );
});

type InputOrder = RawOrder & { isbn: string | undefined };
type OrderData = Partial<Omit<RawOrder, "created">> & {
  created: Date;
  customer?: Customer;
  item?: Item | null;
};

export const OrderForm = ({
  title,
  onSubmit,
  data,
  children,
  formId,
}: {
  title: string;
  onSubmit: (
    data: RawOrder,
  ) => Promise<{ type: "error" | "success"; msg: string }>;
  data: OrderData;
  formId: string;
  children: React.ReactNode;
}): React.ReactElement => {
  const defaultValues = {
    ...data,
    created: toInputDate(data.created),
    isbn: data.item?.isbn,
    contact: data.contact ?? "unknown",
  };
  const { register, handleSubmit, reset, setValue, watch } =
    useForm<InputOrder>({
      defaultValues,
      shouldUseNativeValidation: true,
    });
  const [customer, setCustomer] = React.useState<Customer | null>(
    data.customer ?? null,
  );
  const [item, setItem] = React.useState<Item | NewItem | null>(
    data.item ?? { id: null, title: data.itemTitle ?? "" },
  );
  const utils = trpc.useUtils();
  const contact = watch("contact");

  const submit = async (order: InputOrder) => {
    if (order.isbn && !order.itemId) {
      const result = await utils.isbnSearch.fetch(order.isbn);
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
    // Convert timezoned date to UTC date to avoid mismatch with server time
    order.created = new Date(order.created).toISOString();
    const { type } = await onSubmit(order);
    if (type !== "success") {
      reset();
    }
  };

  const updateCustomer = (customer: Customer | null) => {
    setCustomer(customer);
    setValue("customerId", customer?.id ?? null);
  };

  const updateItem = (item: Item | NewItem | null) => {
    setItem(item);
    setValue("itemId", item?.id ?? null);
    setValue("itemTitle", item?.title ?? "");
    setValue("isbn", item && "isbn" in item ? item.isbn : "");
  };

  return (
    <Card className="max-h-full flex flex-col">
      <CardTitle>{title}</CardTitle>
      <form id={formId} onSubmit={handleSubmit(submit)} />
      <CardBody className="flex-col gap-5">
        <div className="flex flex-col">
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
          <FormRow label="Contacter par" fieldClass="gap-2">
            <ContactMean
              mean="unknown"
              isActive={contact === "unknown"}
              {...register("contact")}
            >
              Non renseigné
            </ContactMean>
            <ContactMean
              mean="in person"
              isActive={contact === "in person"}
              {...register("contact")}
            >
              <FontAwesomeIcon icon={faWalking} className="mr-1" />
              Passera
            </ContactMean>
            <ContactMean
              mean="phone"
              isActive={contact === "phone"}
              {...register("contact")}
            >
              <FontAwesomeIcon icon={faPhone} className="mr-1" />
              <em>{customer?.phone}</em>
            </ContactMean>
            <ContactMean
              mean="mail"
              isActive={contact === "mail"}
              {...register("contact")}
            >
              <FontAwesomeIcon icon={faAt} className="mr-1" />
              <em>{customer?.email}</em>
            </ContactMean>
          </FormRow>
          <FormRow label="Date">
            <Input type="datetime-local" {...register("created")} />
          </FormRow>
          <FormRow label="ISBN">
            <Input
              {...register("isbn", {
                validate: (isbn: string | undefined) =>
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
    </Card>
  );
};
