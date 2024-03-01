import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Combobox } from "@headlessui/react";
import { clsx } from "clsx";
import { Fragment, type HTMLProps, useState } from "react";

import { COMMON_STYLES } from "@/components/FormControls";
import type { Item } from "@/utils/item";
import { trpc } from "@/utils/trpc";

const getLabel = (item: Item | null) => (item ? item.title : "");

export type NewItem = { _id: null; title: string };

type Props = {
  inputClass?: string;
  item: Item | NewItem | null;
  setItem: (item: Item | NewItem | null) => void;
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
    <Combobox value={item} by="_id" onChange={setItem} nullable>
      <div className={clsx("relative", fullWidth ? "w-full" : "w-fit")}>
        <Combobox.Input
          className={clsx(inputStyles, inputClass)}
          displayValue={getLabel}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          {...inputProps}
        />
        <Combobox.Options className="absolute z-10 w-full max-h-40 overflow-auto rounded-md p-1 shadow-lg ring-1 ring-black/5 bg-gray-light">
          {search.length > 0 && (
            <Combobox.Option value={{ _id: null, title: search }}>
              {search}
            </Combobox.Option>
          )}
          {filteredItems.map((item) => (
            <Combobox.Option key={item._id} value={item} as={Fragment}>
              {({ active, selected }) => (
                <li
                  className={clsx(
                    "pl-8 relative",
                    active ? "bg-gray-light" : "bg-white",
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
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </div>
    </Combobox>
  );
}
