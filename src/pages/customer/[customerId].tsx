import * as React from "react";
import {
  faCheckCircle,
  faTimesCircle,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import ContentLoader from "react-content-loader";
import { toast } from "react-toastify";

import { Button, LinkButton } from "@/components/Button";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { CustomerForm, CustomerFormFields } from "@/components/CustomerForm";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Title } from "@/components/Title";
import { trpc } from "@/utils/trpc";

const CARD_TITLE = "Modifier un⋅e client⋅e";

const SkeletonRow = ({ n }: { n: number }) => (
  <>
    <rect x="5%" y={n * 50} rx="2" ry="2" width="12%" height="30" />
    <rect x="20%" y={n * 50} rx="2" ry="2" width="30%" height="30" />
  </>
);

const CustomerFormSkeleton = (): JSX.Element => (
  <ContentLoader height={300} width="100%">
    {Array(4)
      .fill(0)
      .map((_, i) => (
        <SkeletonRow key={i} n={i} />
      ))}
  </ContentLoader>
);

const CustomerLoader = ({ id }: { id: string }) => {
  const result = trpc.customer.useQuery(id);
  const utils = trpc.useUtils();
  const mutation = trpc.updateCustomer.useMutation({
    async onSuccess() {
      await utils.customer.invalidate();
    },
  });
  const deleteMutation = trpc.deleteCustomer.useMutation();
  const router = useRouter();

  const submit = async (customer: CustomerFormFields) => {
    return await mutation.mutateAsync({ customer, customerId: id });
  };

  const onSuccess = () => {
    // do nothing
  };

  const deleteCustomer = async () => {
    const res = await deleteMutation.mutateAsync({ id });
    if (res.type === "success") {
      toast.success(res.msg);
      await router.push("/customers");
    } else {
      toast.error(res.msg);
    }
  };

  if (result.status === "error") {
    return (
      <Card>
        <CardTitle>{CARD_TITLE}</CardTitle>
        <CardBody>
          <ErrorMessage />
        </CardBody>
      </Card>
    );
  }

  if (result.data == null) {
    return (
      <Card>
        <CardTitle>{CARD_TITLE}</CardTitle>
        <CardBody>
          <CustomerFormSkeleton />
        </CardBody>
      </Card>
    );
  }

  return (
    <CustomerForm
      title={CARD_TITLE}
      onSubmit={submit}
      data={result.data}
      onSuccess={onSuccess}
    >
      <Button
        type="button"
        className="mr-auto !bg-[#991b1b]"
        onClick={deleteCustomer}
      >
        <FontAwesomeIcon icon={faTrash} className="mr-sm" />
        Supprimer
      </Button>
      <LinkButton
        href="/customers"
        className="mr-2 px-md [background-color:#6E6E6E]"
      >
        <FontAwesomeIcon icon={faTimesCircle} className="mr-sm" />
        Annuler
      </LinkButton>
      <Button type="submit" className="px-md">
        <FontAwesomeIcon icon={faCheckCircle} className="mr-sm" />
        Modifier
      </Button>
    </CustomerForm>
  );
};

const UpdateCustomer = () => {
  const router = useRouter();
  const { customerId } = router.query;
  if (typeof customerId !== "string") {
    return null;
  }
  return (
    <div className="2xl:([margin-left:10%] [margin-right:10%]) flex-1">
      <Title>Modifier un client</Title>
      <CustomerLoader id={customerId} />
    </div>
  );
};

export default UpdateCustomer;
