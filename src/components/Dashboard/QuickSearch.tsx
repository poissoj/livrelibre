import { Card } from "@/components/Card";
import { ButtonWithInput } from "@/components/Button";
import { InputWithButton } from "@/components/FormControls";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "twin.macro";

export const QuickSearch = (): JSX.Element => (
  <Card title="Articles - Recherche rapide">
    <form tw="flex p-sm">
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
