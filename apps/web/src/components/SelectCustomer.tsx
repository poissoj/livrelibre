import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { keepPreviousData } from "@tanstack/react-query";
import { clsx } from "clsx";
import { Fragment, type HTMLProps, useState } from "react";

import type { Customer } from "@livrelibre/shared/customer";

import { COMMON_STYLES } from "@/components/FormControls";
import { trpc } from "@/utils/trpc";
import { useDebouncedValue } from "@/utils/useDebouncedValue";
import { useDelayedLoading } from "@/utils/useDelayedLoading";

const getLabel = (customer: Customer | null) =>
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
  const debouncedQuery = useDebouncedValue(query, 300);
  const res = trpc.searchCustomer.useQuery(debouncedQuery, {
    staleTime: 60000,
    placeholderData: keepPreviousData,
  });
  const showLoading = useDelayedLoading(res.isFetching, 500);

  const filteredCustomers = res.data || [];
  const inputStyles = fullWidth
    ? COMMON_STYLES
    : COMMON_STYLES.replace("w-full", "w-fit");

  return (
    <Combobox value={customer} by="id" onChange={setCustomer}>
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
          {showLoading && (
            <li className="px-2 py-1 text-sm italic">Chargement…</li>
          )}
          {res.isError && (
            <li className="px-2 py-1 text-sm [color:#721c24]">
              Erreur de chargement
            </li>
          )}
          {filteredCustomers.map((customer) => (
            <ComboboxOption key={customer.id} value={customer} as={Fragment}>
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
