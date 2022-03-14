import { faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import type { DOMAttributes } from "react";
import { toast } from "react-toastify";
import tw from "twin.macro";

import { trpc } from "@/utils/trpc";

const Input = tw.input`flex-1 padding[5px 10px] rounded bg-white/80 pr-7
  focus-visible:(ring-2 ring-inset outline-none) --tw-ring-color[#AAA]`;
const SearchButton = tw.button`text-black absolute top-2 bottom-2 right-1 px-2`;

export const QuickSearch = ({
  className,
}: {
  className?: string;
}): JSX.Element => {
  const router = useRouter();
  const isbnSearch = trpc.useMutation(["isbnSearch"]);

  const handleSubmit: DOMAttributes<HTMLFormElement>["onSubmit"] = async (
    event
  ) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const search = form.get("search");
    if (typeof search !== "string" || search.length === 0) {
      return;
    }
    if (/^\d{10,}$/.test(search)) {
      const result = await isbnSearch.mutateAsync(search);
      if (result.count === 0) {
        toast.info("Aucun article trouvé pour cet ISBN");
        return;
      }
      const pathname = `/item/${result.items[0]._id}`;
      void router.push({ pathname });
      return;
    }
    void router.push({ pathname: "/quicksearch", query: { search } });
  };

  return (
    <form
      role="search"
      className={className}
      tw="flex p-sm width[27rem] relative"
      onSubmit={handleSubmit}
    >
      <Input type="text" placeholder="ISBN, titre, auteur" name="search" />
      <SearchButton
        type="submit"
        aria-label="Rechercher"
        disabled={isbnSearch.isLoading}
      >
        <FontAwesomeIcon
          icon={isbnSearch.isLoading ? faSpinner : faSearch}
          spin={isbnSearch.isLoading}
          tw="mx-1"
        />
      </SearchButton>
    </form>
  );
};
