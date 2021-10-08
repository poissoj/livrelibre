import { Card } from "@/components/Card";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@/components/Button";
import { Input, Select } from "@/components/FormControls";
import { FormRow } from "@/components/FormRow";
import "twin.macro";

export const SellNewItem = (): JSX.Element => (
  <Card title="Vendre un article non répertorié">
    <form tw="flex flex-col">
      <FormRow label="Prix">
        <Input type="text" name="price" />
      </FormRow>
      <FormRow label="Titre">
        <Input type="text" name="title" placeholder="Article indépendant" />
      </FormRow>
      <FormRow label="Type">
        <Select name="type" defaultValue="book">
          <option value="unknown">Inconnu</option>
          <option value="book">Livre</option>
          <option value="game">Jeu</option>
          <option value="postcard">Carte postale</option>
          <option value="stationery">Papeterie</option>
          <option value="dvd">DVD</option>
        </Select>
      </FormRow>
      <FormRow label="TVA">
        <Select name="tva" defaultValue="5.5">
          <option value="20">20%</option>
          <option value="5.5">5.5%</option>
          <option value="2.1">2.1%</option>
          <option value="0">0%</option>
        </Select>
      </FormRow>
      <Button disabled tw="align-self[center]">
        <FontAwesomeIcon icon={faCartPlus} tw="mr-sm" />
        Ajouter au panier
      </Button>
    </form>
  </Card>
);