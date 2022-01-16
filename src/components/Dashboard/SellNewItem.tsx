import { Card } from "@/components/Card";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@/components/Button";
import { Input, Select } from "@/components/FormControls";
import { FormRow } from "@/components/FormRow";
import "twin.macro";
import { ITEM_TYPES } from "@/utils/item";

export const SellNewItem = (): JSX.Element => (
  <Card title="Vendre un article non répertorié" tw="mb-lg">
    <form tw="flex flex-col flex-1">
      <FormRow label="Prix">
        <Input type="number" name="price" />
      </FormRow>
      <FormRow label="Titre">
        <Input type="text" name="title" placeholder="Article indépendant" />
      </FormRow>
      <FormRow label="Type">
        <Select name="type" defaultValue="book">
          {Object.entries(ITEM_TYPES).map(([key, label]) => (
            <option value={key} key={key}>
              {label}
            </option>
          ))}
        </Select>
      </FormRow>
      <FormRow label="TVA">
        <Select name="tva" defaultValue="5.5">
          <option value="20">20.0%</option>
          <option value="5.5">5.5%</option>
          <option value="2.1">2.1%</option>
          <option value="0">0.0%</option>
        </Select>
      </FormRow>
      <Button type="submit" disabled tw="align-self[center]">
        <FontAwesomeIcon icon={faCartPlus} tw="mr-sm" />
        Ajouter au panier
      </Button>
    </form>
  </Card>
);
