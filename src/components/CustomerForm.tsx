import * as React from "react";
import { useForm } from "react-hook-form";

import { Alert } from "@/components/Alert";
import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import { Input, Textarea } from "@/components/FormControls";
import { FormRow } from "@/components/FormRow";
import type { Customer } from "@/utils/customer";

export type CustomerFormFields = Omit<Customer, "purchases">;

type TAlert = {
  type: React.ComponentProps<typeof Alert>["type"];
  message: string;
};

export const CustomerForm = ({
  title,
  onSubmit,
  data,
  children,
  onSuccess,
}: {
  title: string;
  onSubmit(
    data?: CustomerFormFields,
  ): Promise<{ type: "error" | "success"; msg: string }>;
  data?: CustomerFormFields;
  onSuccess?(): void;
  children: React.ReactNode;
}): JSX.Element => {
  const { register, handleSubmit, reset } = useForm<CustomerFormFields>({
    defaultValues: data || {},
  });
  const [alert, setAlert] = React.useState<TAlert | null>(null);

  const submit = async (data: CustomerFormFields) => {
    const { type, msg: message } = await onSubmit(data);
    setAlert({ type, message });
    if (type === "success") {
      onSuccess ? onSuccess() : reset();
    }
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
            <FormRow label="Nom complet">
              <Input type="text" {...register("fullname")} />
            </FormRow>
            <FormRow label="Contact">
              <Input type="text" {...register("contact")} />
            </FormRow>
            <FormRow label="Téléphone">
              <Input type="tel" {...register("phone")} />
            </FormRow>
            <FormRow label="Email">
              <Input type="email" {...register("email")} />
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
