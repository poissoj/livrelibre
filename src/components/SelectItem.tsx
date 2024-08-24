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
import { formatPrice } from "@/utils/format";
import type { Item } from "@/utils/item";
import { trpc } from "@/utils/trpc";

export type NewItem = { id: null; title: string };

type ItemValue = Item | NewItem | null;

const getLabel = (item: ItemValue) => (item ? item.title : "");

type Props = {
  inputClass?: string;
  item: ItemValue;
  setItem: (item: ItemValue) => void;
  fullWidth?: boolean;
} & Pick<HTMLProps<HTMLInputElement>, "placeholder" | "required">;

export function SelectItem({
  inputClass,
  item,
  setItem,
  fullWidth,
  ...inputProps
}: Props) {
  const [search, setSearch] = useState("");
  const res = trpc.quicksearch.useQuery({ search }, { staleTime: 60000 });

  const filteredItems = res.data?.items || [];
  const inputStyles = fullWidth
    ? COMMON_STYLES
    : COMMON_STYLES.replace("w-full", "w-fit");

  return (
    <Combobox value={item as Item} by="id" onChange={setItem}>
      <div className={clsx("relative", fullWidth ? "w-full" : "w-fit")}>
        <ComboboxInput
          className={clsx(inputStyles, inputClass)}
          displayValue={getLabel}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          {...inputProps}
        />
        <ComboboxOptions
          className="absolute z-10 w-full max-h-56 overflow-auto rounded-md shadow-lg ring-1 ring-black/5 bg-gray-light"
          as="ul"
        >
          {search.length > 0 && (
            <ComboboxOption value={{ _id: null, title: search }}>
              {search}
            </ComboboxOption>
          )}
          {filteredItems.map((item) => (
            <ComboboxOption key={item.id} value={item} as={Fragment}>
              {({ focus, selected }) => (
                <li
                  className={clsx(
                    "px-2 flex gap-2 items-center",
                    focus ? "bg-gray-light" : "bg-white",
                  )}
                >
                  <span className={clsx(!selected && "invisible")}>
                    <FontAwesomeIcon icon={faCheck} />
                  </span>
                  <div className="flex flex-col grow py-1">
                    <span className="leading-tight">{item.title}</span>
                    <div className="text-xs">
                      <span className="mr-2">{item.distributor}</span>
                      <span className="italic mr-auto">{item.isbn}</span>
                    </div>
                  </div>
                  <span className="font-number text-sm">
                    {formatPrice(Number(item.price))}
                  </span>
                </li>
              )}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
