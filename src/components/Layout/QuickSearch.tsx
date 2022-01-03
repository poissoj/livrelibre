import { ButtonWithInput } from "@/components/Button";
import { InputWithButton } from "@/components/FormControls";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "twin.macro";
import type { DOMAttributes } from "react";
import { useRouter } from "next/router";

export const QuickSearch = (): JSX.Element => {
  const router = useRouter();

  const handleSubmit: DOMAttributes<HTMLFormElement>["onSubmit"] = (event) => {
    event.preventDefault();
    const search: string = event.currentTarget.search.value;
    router.push({ pathname: "/quicksearch", query: { search } });
  };

  return (
    <form role="search" tw="flex p-sm width[27rem]" onSubmit={handleSubmit}>
      <InputWithButton
        type="text"
        placeholder="ISBN, titre, auteur"
        name="search"
        tw="flex-1"
      />
      <ButtonWithInput aria-label="Rechercher">
        <FontAwesomeIcon icon={faSearch} tw="mx-1" />
      </ButtonWithInput>
    </form>
  );
};
