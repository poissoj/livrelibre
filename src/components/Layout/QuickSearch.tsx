import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import type { DOMAttributes } from "react";
import tw from "twin.macro";

const Input = tw.input`flex-1 padding[5px 10px] rounded bg-white/80 pr-7
  focus-visible:(ring-2 ring-inset outline-none) --tw-ring-color[#AAA]`;
const SearchButton = tw.button`text-black absolute top-2 bottom-2 right-1 px-2`;

export const QuickSearch = ({
  className,
}: {
  className?: string;
}): JSX.Element => {
  const router = useRouter();

  const handleSubmit: DOMAttributes<HTMLFormElement>["onSubmit"] = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const search = form.get("search");
    if (typeof search === "string") {
      void router.push({ pathname: "/quicksearch", query: { search } });
    }
  };

  return (
    <form
      role="search"
      className={className}
      tw="flex p-sm width[27rem] relative"
      onSubmit={handleSubmit}
    >
      <Input type="text" placeholder="ISBN, titre, auteur" name="search" />
      <SearchButton type="submit" aria-label="Rechercher">
        <FontAwesomeIcon icon={faSearch} tw="mx-1" />
      </SearchButton>
    </form>
  );
};
