import { faTimesCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
} from "@headlessui/react";
import React from "react";

import { Button } from "@/components/Button";

export const ConfirmationDialog = (props: {
  title: string;
  message: string;
  onConfirm: () => void;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const close = () => {
    setIsOpen(false);
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
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Dialog onClose={close} className="relative">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            <Transition
              appear
              show={isOpen}
              enter="ease-out duration-300"
              enterFrom="scale-95"
              enterTo="scale-100"
              leave="ease-in duration-200"
              leaveFrom="scale-100"
              leaveTo="scale-95"
            >
              <DialogPanel className="w-full max-w-lg space-y-4 bg-white p-8 rounded-xl">
                <DialogTitle className="font-bold">{props.title}</DialogTitle>
                <p>{props.message}</p>
                <div className="flex">
                  <Button
                    type="button"
                    className="!bg-[#991b1b]"
                    onClick={props.onConfirm}
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-sm" />
                    Oui, supprimer
                  </Button>
                  <Button
                    type="button"
                    className="ml-auto !bg-[#6E6E6E]"
                    onClick={close}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} className="mr-sm" />
                    Non, annuler
                  </Button>
                </div>
              </DialogPanel>
            </Transition>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
