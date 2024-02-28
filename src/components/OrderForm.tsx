import * as React from "react";
import { useForm } from "react-hook-form";

import { Alert } from "@/components/Alert";
import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import { Input, Textarea } from "@/components/FormControls";
import { FormRow } from "@/components/FormRow";
import { SelectCustomer } from "@/components/SelectCustomer";
import type { Customer } from "@/utils/customer";
import type { DBOrder } from "@/utils/order";

export type OrderFormFields = DBOrder;

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
  onSubmit(
    data?: OrderFormFields,
  ): Promise<{ type: "error" | "success"; msg: string }>;
  data?: OrderFormFields;
  onSuccess?(): void;
  children: React.ReactNode;
}): JSX.Element => {
  const { register, handleSubmit, reset, setValue } = useForm<OrderFormFields>({
    defaultValues: data || {},
  });
  const [alert, setAlert] = React.useState<TAlert | null>(null);
  const [customer, setCustomer] = React.useState<Customer | null>(null);

  const submit = async (data: OrderFormFields) => {
    const { type, msg: message } = await onSubmit(data);
    setAlert({ type, message });
    if (type === "success") {
      onSuccess ? onSuccess() : reset();
    }
  };

  const updateCustomer = (customer: Customer | null) => {
    setCustomer(customer);
    setValue("customerId", customer?._id ?? "");
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
              <Input type="text" {...register("isbn")} required />
            </FormRow>
            <FormRow label="Commentaires">
              <Textarea {...register("comment")} />
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
