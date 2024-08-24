import * as React from "react";
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import ContentLoader from "react-content-loader";

import { Button, LinkButton } from "@/components/Button";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { type FormFields, ItemForm } from "@/components/ItemForm";
import { Title } from "@/components/Title";
import { trpc } from "@/utils/trpc";

const CARD_TITLE = "Modifier un article";

const SkeletonRow = ({ n }: { n: number }) => (
  <>
    <rect x="5%" y={n * 50} rx="2" ry="2" width="12%" height="30" />
    <rect x="20%" y={n * 50} rx="2" ry="2" width="30%" height="30" />
    <rect x="53%" y={n * 50} rx="2" ry="2" width="12%" height="30" />
    <rect x="68%" y={n * 50} rx="2" ry="2" width="30%" height="30" />
  </>
);

const ItemFormSkeleton = (): JSX.Element => (
  <ContentLoader height={410} width="100%">
    {Array(7)
      .fill(0)
      .map((_, i) => (
        <SkeletonRow key={i} n={i} />
      ))}
  </ContentLoader>
);

const ItemLoader = ({ id }: { id: number }) => {
  const result = trpc.searchItem.useQuery(id);
  const mutation = trpc.updateItem.useMutation();
  const router = useRouter();

  const submit = async (data: FormFields) => {
    const datebought = data.datebought.split("-").reverse().join("/");
    const item = { ...data, amount: Number(data.amount), datebought };
    return await mutation.mutateAsync({ item, id });
  };

  const onSuccess = () => {
    void router.push(`/item/${id}?status=updated`);
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
          <ItemFormSkeleton />
        </CardBody>
      </Card>
    );
  }

  const data: FormFields = {
    ...result.data,
    amount: String(result.data.amount),
    datebought: result.data.datebought.split("/").reverse().join("-"),
  };

  return (
    <ItemForm
      title={CARD_TITLE}
      onSubmit={submit}
      data={data}
      onSuccess={onSuccess}
    >
      <LinkButton
        href={`/item/${id}`}
        className="mr-2 px-md [background-color:#6E6E6E]"
      >
        <FontAwesomeIcon icon={faTimesCircle} className="mr-sm" />
        Annuler
      </LinkButton>
      <Button type="submit" className="px-md">
        <FontAwesomeIcon icon={faCheckCircle} className="mr-sm" />
        Modifier
      </Button>
    </ItemForm>
  );
};

const UpdateItem = () => {
  const router = useRouter();
  const { itemId } = router.query;
  if (typeof itemId !== "string") {
    return null;
  }
  return (
    <div className="2xl:([margin-left:10%] [margin-right:10%]) flex-1">
      <Title>Modifier un article</Title>
      <ItemLoader id={Number(itemId)} />
    </div>
  );
};

export default UpdateItem;
