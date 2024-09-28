import * as React from "react";
import {
  faAt,
  faCheckCircle,
  faPhone,
  faTimesCircle,
  faUserPlus,
  faWalking,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { Button } from "@/components/Button";
import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import type { CustomerFormFields } from "@/components/CustomerForm";
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

const CustomerFormBody = (props: {
  hide: () => void;
  onAdd: (customer: Customer) => void;
  className?: string;
}) => {
  const { register, handleSubmit, formState } = useForm<CustomerFormFields>();
  const mutation = trpc.updateCustomer.useMutation();
  const submit = async (customer: CustomerFormFields) => {
    const resp = await mutation.mutateAsync({ customer });
    if (resp.type === "success") {
      toast.success(resp.msg);
      props.onAdd({ ...customer, id: resp.id });
      props.hide();
    } else {
      toast.error(resp.msg);
    }
  };
  return (
    <form
      onSubmit={handleSubmit(submit)}
      className={clsx(
        "transition-maxHeight duration-200 overflow-hidden",
        props.className,
      )}
    >
      <FormRow label="Nom complet">
        <Input type="text" {...register("fullname")} required />
      </FormRow>
      <FormRow label="Téléphone">
        <Input type="tel" {...register("phone")} />
      </FormRow>
      <FormRow label="Email">
        <Input type="email" {...register("email")} />
      </FormRow>
      <FormRow label="Remarque contact">
        <Input type="text" {...register("contact")} />
      </FormRow>
      <FormRow label="Commentaires">
        <Textarea {...register("comment")} />
      </FormRow>
      <div className="flex justify-end mb-4 mr-20">
        <Button
          type="button"
          className="px-md mr-4 [background-color:#6E6E6E]"
          onClick={props.hide}
        >
          <FontAwesomeIcon icon={faTimesCircle} className="mr-sm" />
          Annuler
        </Button>
        <Button
          type="submit"
          className="px-md"
          disabled={formState.isSubmitting}
        >
          <FontAwesomeIcon icon={faCheckCircle} className="mr-sm" />
          Ajouter
        </Button>
      </div>
    </form>
  );
};

type InputOrder = Omit<RawOrder, "customerId"> & {
  isbn: string | undefined;
  customerId: number | null;
};
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
  const [showCustomerForm, setShowCustomerForm] = React.useState(false);
  const utils = trpc.useUtils();
  const contact = watch("contact");

  const toggleCustomerForm = () => {
    setShowCustomerForm((show) => !show);
  };

  const submit = async (order: InputOrder) => {
    if (order.isbn && !order.itemId) {
      const result = await utils.isbnSearch.fetch(order.isbn);
      if (result.count === 0) {
        toast.info("Aucun article trouvé pour cet ISBN");
      }
      updateItem(result.items[0]);
      return;
    }
    if (!order.customerId) {
      toast.info("Merci de sélectionner un⋅e client⋅e");
      return;
    }
    if (!order.itemTitle) {
      toast.info("Merci de renseigner le titre ou l'ISBN de l'article");
      return;
    }
    // Convert timezoned date to UTC date to avoid mismatch with server time
    order.created = new Date(order.created).toISOString();
    const { type } = await onSubmit({ ...order, customerId: order.customerId });
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
            {showCustomerForm ? (
              <Input
                type="text"
                className="w-full bg-[#ccc] cursor-not-allowed"
                disabled
                value="Nouveau client"
              />
            ) : (
              <SelectCustomer
                customer={customer}
                setCustomer={updateCustomer}
                fullWidth
                required
              />
            )}
            <Button
              className="ml-sm self-center"
              title="Nouveau client"
              type="button"
              onClick={toggleCustomerForm}
            >
              <FontAwesomeIcon icon={faUserPlus} />
            </Button>
          </FormRow>
          <CustomerFormBody
            hide={toggleCustomerForm}
            onAdd={updateCustomer}
            className={showCustomerForm ? "max-h-[500px]" : "max-h-0"}
          />
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
              required
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
