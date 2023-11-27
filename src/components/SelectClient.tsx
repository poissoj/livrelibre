import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Combobox } from "@headlessui/react";
import { clsx } from "clsx";
import { Fragment, useState } from "react";

import { DBCustomer } from "@/utils/customer";
import { trpc } from "@/utils/trpc";

const INPUT_STYLES = clsx(
  "rounded px-2 py-1 focus:border-primary-default focus:outline-none [border:2px_solid_#ccc]",
  "[transition:border-color_ease-in-out_0.15s]",
);

const getLabel = (customer: DBCustomer | null) =>
  customer ? `${customer.fullname}` : "";

export function SelectClient({ inputClass }: { inputClass?: string }) {
  const [selectedCustomer, setSelectedCustomer] = useState<DBCustomer | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const res = trpc.searchCustomer.useQuery(query);

  const filteredCustomers = res.data || [];

  return (
    <Combobox
      value={selectedCustomer}
      by="_id"
      onChange={setSelectedCustomer}
      nullable
    >
      <div className="relative w-fit">
        <Combobox.Input
          className={clsx(INPUT_STYLES, inputClass)}
          displayValue={getLabel}
          placeholder="Associer un client…"
          onChange={(event) => {
            setQuery(event.target.value);
          }}
        />
        <Combobox.Options className="absolute w-full overflow-auto rounded-md p-1 shadow-lg ring-1 ring-black/5 bg-gray-light">
          {filteredCustomers.map((customer) => (
            <Combobox.Option key={customer._id} value={customer} as={Fragment}>
              {({ active, selected }) => (
                <li
                  className={clsx(
                    "pl-8 relative",
                    active ? "bg-gray-light" : "bg-white",
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
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </div>
    </Combobox>
  );
}