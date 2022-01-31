import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import tw from "twin.macro";
import type { DOMAttributes } from "react";
import { useRouter } from "next/router";

const Input = tw.input`flex-1 padding[5px 10px] border-radius[3px] bg-white/80 focus-visible:(ring-2 ring-inset outline-none) --tw-ring-color[#AAA]`;
const SearchButton = tw.button`text-black`;

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
      <Input
        type="text"
        placeholder="ISBN, titre, auteur"
        name="search"
        tw="pr-6"
      />
      <SearchButton
        type="submit"
        aria-label="Rechercher"
        tw="absolute top-2 bottom-2 right-1 px-2"
      >
        <FontAwesomeIcon icon={faSearch} tw="mx-1" />
      </SearchButton>
    </form>
  );
};
