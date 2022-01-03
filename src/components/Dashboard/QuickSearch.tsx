import { Card } from "@/components/Card";
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
    <Card title="Articles - Recherche rapide" tw="min-width[24rem]">
      <form tw="flex p-sm flex-1" onSubmit={handleSubmit}>
        <InputWithButton
          type="text"
          placeholder="ISBN, titre, auteur"
          name="search"
          tw="flex-1"
        />
        <ButtonWithInput>
          <FontAwesomeIcon icon={faSearch} tw="mr-sm" />
          Rechercher
        </ButtonWithInput>
      </form>
    </Card>
  );
};
