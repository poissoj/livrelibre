import { Card } from "@/components/Card";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@/components/Button";
import { Input, Select } from "@/components/FormControls";
import tw from "twin.macro";

const Label = tw.label`flex cursor-pointer mb-md align-items[center]`;
const RowLabel = tw.span`text-right mr-lg font-medium w-1/4`;

export const SellNewItem = (): JSX.Element => (
  <Card title="Vendre un article non répertorié">
    <form tw="flex flex-col pr-lg">
      <Label>
        <RowLabel>Prix</RowLabel>
        <Input type="text" name="price" />
      </Label>
      <Label>
        <RowLabel>Titre</RowLabel>
        <Input type="text" name="title" placeholder="Article indépendant" />
      </Label>
      <Label>
        <RowLabel>Type</RowLabel>
        <Select name="type" defaultValue="book">
          <option value="unknown">Inconnu</option>
          <option value="book">Livre</option>
          <option value="game">Jeu</option>
          <option value="postcard">Carte postale</option>
          <option value="stationery">Papeterie</option>
          <option value="dvd">DVD</option>
        </Select>
      </Label>
      <Label>
        <RowLabel>TVA</RowLabel>
        <Select name="tva" defaultValue="5.5">
          <option value="20">20%</option>
          <option value="5.5">5.5%</option>
          <option value="2.1">2.1%</option>
          <option value="0">0%</option>
        </Select>
      </Label>
      <Button disabled tw="align-self[center]">
        <FontAwesomeIcon icon={faCartPlus} tw="mr-sm" />
        Ajouter au panier
      </Button>
    </form>
  </Card>
);
