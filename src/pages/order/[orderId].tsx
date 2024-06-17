import * as React from "react";
import {
  faCheckCircle,
  faTimesCircle,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
} from "@headlessui/react";
import { useRouter } from "next/router";
import ContentLoader from "react-content-loader";
import { toast } from "react-toastify";

import { Button, LinkButton } from "@/components/Button";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { OrderForm } from "@/components/OrderForm";
import { Title } from "@/components/Title";
import { type Order, deserializeOrder } from "@/utils/order";
import { trpc } from "@/utils/trpc";

const CARD_TITLE = "Modifier une commande";

const SkeletonRow = ({ n }: { n: number }) => (
  <>
    <rect x="5%" y={n * 50} rx="2" ry="2" width="12%" height="30" />
    <rect x="20%" y={n * 50} rx="2" ry="2" width="30%" height="30" />
  </>
);

const OrderFormSkeleton = (): JSX.Element => (
  <ContentLoader height={300} width="100%">
    {Array(4)
      .fill(0)
      .map((_, i) => (
        <SkeletonRow key={i} n={i} />
      ))}
  </ContentLoader>
);

const DeleteOrder = ({ id }: { id: string }) => {
  const router = useRouter();
  const deleteMutation = trpc.deleteOrder.useMutation();
  const [isOpen, setIsOpen] = React.useState(false);
  const close = () => {
    setIsOpen(false);
  };

  const deleteOrder = async () => {
    const res = await deleteMutation.mutateAsync({ id });
    if (res.type === "success") {
      toast.success(res.msg);
      await router.push("/orders");
    } else {
      toast.error(res.msg);
    }
  };

  return (
    <>
      <Button
        type="button"
        className="mr-auto !bg-[#991b1b]"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <FontAwesomeIcon icon={faTrash} className="mr-sm" />
        Supprimer
      </Button>
      <Transition
        appear
        show={isOpen}
        enter="ease-out duration-300"
        enterFrom="opacity-0 transform-[scale(95%)]"
        enterTo="opacity-100 transform-[scale(100%)]"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 transform-[scale(100%)]"
        leaveTo="opacity-0 transform-[scale(95%)]"
      >
        <Dialog onClose={close} className="relative">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            <DialogPanel className="max-w-lg space-y-4 bg-white p-8 rounded-xl">
              <DialogTitle className="font-bold">
                Supprimer une commande
              </DialogTitle>
              <p>
                Êtes vous sûr de vouloir supprimer cette commande ? Cette action
                ne peut pas être annulée.
              </p>
              <div className="flex">
                <Button
                  type="button"
                  className="bg-[#991b1b]"
                  onClick={deleteOrder}
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-sm" />
                  Oui, supprimer
                </Button>
                <Button
                  type="button"
                  className="ml-auto bg-[#6E6E6E]"
                  onClick={close}
                >
                  <FontAwesomeIcon icon={faTimesCircle} className="mr-sm" />
                  Non, annuler
                </Button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

const OrderLoader = ({ id }: { id: string }) => {
  const result = trpc.order.useQuery(id);
  const utils = trpc.useUtils();
  const router = useRouter();
  const mutation = trpc.updateOrder.useMutation({
    async onSuccess(data) {
      if (data.type === "success") {
        await utils.order.invalidate();
        toast.success(data.msg);
        void router.push("/orders");
      } else {
        toast.error(data.msg);
      }
    },
  });

  const submit = async (data: Order) => {
    const order = { ...data, date: data.date.toISOString() };
    return await mutation.mutateAsync({ order, id });
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
          <OrderFormSkeleton />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <OrderForm
        title={CARD_TITLE}
        onSubmit={submit}
        data={deserializeOrder(result.data)}
      >
        <DeleteOrder id={id} />
        <LinkButton
          href="/orders"
          className="mr-2 px-md [background-color:#6E6E6E]"
        >
          <FontAwesomeIcon icon={faTimesCircle} className="mr-sm" />
          Annuler
        </LinkButton>
        <Button type="submit" className="px-md">
          <FontAwesomeIcon icon={faCheckCircle} className="mr-sm" />
          Modifier
        </Button>
      </OrderForm>
    </div>
  );
};

const UpdateOrder = () => {
  const router = useRouter();
  const { orderId } = router.query;
  if (typeof orderId !== "string") {
    return null;
  }
  return (
    <div className="2xl:([margin-left:10%] [margin-right:10%]) flex-1">
      <Title>Modifier une commande</Title>
      <OrderLoader id={orderId} />
    </div>
  );
};

export default UpdateOrder;
