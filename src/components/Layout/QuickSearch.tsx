import { faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx } from "clsx";
import { useRouter } from "next/router";
import { type DOMAttributes, type ReactElement, useState } from "react";
import { toast } from "react-toastify";

import { trpc } from "@/utils/trpc";

export const QuickSearch = ({
  className,
}: {
  className?: string;
}): ReactElement => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [isLoading, setLoading] = useState(false);

  const handleSubmit: DOMAttributes<HTMLFormElement>["onSubmit"] = async (
    event,
  ) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const search = form.get("search");
    if (typeof search !== "string" || search.length === 0) {
      return;
    }
    if (/^\d{10,}$/.test(search)) {
      setLoading(true);
      const result = await utils.isbnSearch.fetch(search);
      setLoading(false);
      if (result.count === 0) {
        toast.info("Aucun article trouvé pour cet ISBN");
        return;
      }
      const pathname = `/item/${result.items[0].id}`;
      void router.push({ pathname });
      return;
    }
    void router.push({ pathname: "/quicksearch", query: { search } });
  };

  return (
    <form
      role="search"
      className={clsx("flex p-sm [width:27rem] relative", className)}
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        className="flex-1 [padding:5px_10px] rounded bg-white/80 pr-7
  focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none [--tw-ring-color:#AAA]"
        placeholder="ISBN, titre, auteur·ice"
        name="search"
      />
      <button
        type="submit"
        className="text-black absolute top-2 bottom-2 right-1 px-2"
        aria-label="Rechercher"
        disabled={isLoading}
      >
        <FontAwesomeIcon
          icon={isLoading ? faSpinner : faSearch}
          spin={isLoading}
          className="mx-1"
        />
      </button>
    </form>
  );
};
