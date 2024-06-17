import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { clsx } from "clsx";
import { Fragment, type HTMLProps, useState } from "react";

import { COMMON_STYLES } from "@/components/FormControls";
import type { Customer, DBCustomer } from "@/utils/customer";
import { trpc } from "@/utils/trpc";

const getLabel = (customer: DBCustomer | null) =>
  customer ? customer.fullname : "";

type Props = {
  inputClass?: string;
  customer: Customer | null;
  setCustomer: (customer: Customer | null) => void;
  fullWidth?: boolean;
} & Pick<HTMLProps<HTMLInputElement>, "placeholder" | "required">;

export function SelectCustomer({
  inputClass,
  customer,
  setCustomer,
  fullWidth,
  ...inputProps
}: Props) {
  const [query, setQuery] = useState("");
  const res = trpc.searchCustomer.useQuery(query, { staleTime: 60000 });

  const filteredCustomers = res.data || [];
  const inputStyles = fullWidth
    ? COMMON_STYLES
    : COMMON_STYLES.replace("w-full", "w-fit");

  return (
    <Combobox value={customer} by="_id" onChange={setCustomer}>
      <div className={clsx("relative", fullWidth ? "w-full" : "w-fit")}>
        <ComboboxInput
          className={clsx(inputStyles, inputClass)}
          displayValue={getLabel}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          {...inputProps}
        />
        <ComboboxOptions className="absolute z-10 w-full max-h-40 overflow-auto rounded-md p-1 shadow-lg ring-1 ring-black/5 bg-gray-light">
          {filteredCustomers.map((customer) => (
            <ComboboxOption key={customer._id} value={customer} as={Fragment}>
              {({ focus, selected }) => (
                <li
                  className={clsx(
                    "pl-8 relative",
                    focus ? "bg-gray-light" : "bg-white",
                  )}
                >
                  {getLabel(customer)}
                  {selected && (
                    <span className="absolute inset-y-0 left-0 pl-2 flex items-center">
                      <FontAwesomeIcon icon={faCheck} />
                    </span>
                  )}
                </li>
              )}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
