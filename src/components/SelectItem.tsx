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
import type { Item } from "@/utils/item";
import { trpc } from "@/utils/trpc";

export type NewItem = { _id: null; title: string };

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
    <Combobox value={item as Item} by="_id" onChange={setItem}>
      <div className={clsx("relative", fullWidth ? "w-full" : "w-fit")}>
        <ComboboxInput
          className={clsx(inputStyles, inputClass)}
          displayValue={getLabel}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          {...inputProps}
        />
        <ComboboxOptions className="absolute z-10 w-full max-h-40 overflow-auto rounded-md p-1 shadow-lg ring-1 ring-black/5 bg-gray-light">
          {search.length > 0 && (
            <ComboboxOption value={{ _id: null, title: search }}>
              {search}
            </ComboboxOption>
          )}
          {filteredItems.map((item) => (
            <ComboboxOption key={item._id} value={item} as={Fragment}>
              {({ focus, selected }) => (
                <li
                  className={clsx(
                    "pl-8 relative",
                    focus ? "bg-gray-light" : "bg-white",
                  )}
                >
                  {getLabel(item)}
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
