import { Card } from "@/components/Card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Title } from "@/components/Title";
import { FormRow } from "@/components/FormRow";
import {
  Input,
  InputWithButton,
  Select,
  Textarea,
} from "@/components/FormControls";
import { Button, ButtonWithInput } from "@/components/Button";
import tw from "twin.macro";
import { faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";

const Column = tw.div`flex-1 min-width[20rem]`;

const Add = (): JSX.Element => {
  return (
    <div tw="margin-left[10%] margin-right[10%] flex-1">
      <Title>Ajouter un article</Title>
      <Card title="Ajouter un article" tw="mb-lg">
        <form>
          <div tw="flex flex-wrap gap-lg">
            <Column>
              <FormRow label="Type">
                <Select name="type" defaultValue="book">
                  <option value="book">Livre</option>
                  <option value="game">Jeu</option>
                  <option value="postcard">Carte postale</option>
                  <option value="stationery">Papeterie</option>
                  <option value="dvd">DVD</option>
                  <option value="unknown">Inconnu</option>
                </Select>
              </FormRow>
              <FormRow label="ISBN">
                <InputWithButton type="text" name="isbn" maxLength={13} />
                <ButtonWithInput type="button">
                  <FontAwesomeIcon icon={faSearch} tw="mx-sm" />
                </ButtonWithInput>
              </FormRow>
              <FormRow label="Auteur">
                <Input type="text" name="author" />
              </FormRow>
              <FormRow label="Titre">
                <Input type="text" name="title" />
              </FormRow>
              <FormRow label="Éditeur">
                <Input type="text" name="publisher" />
              </FormRow>
              <FormRow label="Distributeur">
                <Input type="text" name="distributor" />
              </FormRow>
              <FormRow label="Mots-clés">
                <Input type="text" name="keywords" />
              </FormRow>
            </Column>
            <Column>
              <FormRow label="Date d&rsquo;achat">
                <Input type="text" name="datebought" />
              </FormRow>
              <FormRow label="Commentaires">
                <Textarea name="comments" />
              </FormRow>
              <FormRow label="Prix d&rsquo;achat">
                <Input type="number" name="purchasePrice" min={0} step={0.01} />
              </FormRow>
              <FormRow label="Prix de vente">
                <Input type="number" name="price" min={0} step={0.01} />
              </FormRow>
              <FormRow label="Quantité">
                <Input type="number" name="quantity" min={0} defaultValue={1} />
              </FormRow>
              <FormRow label="TVA">
                <Select name="tva" defaultValue="5.5">
                  <option value="20">20%</option>
                  <option value="5.5">5.5%</option>
                  <option value="2.1">2.1%</option>
                  <option value="0">0%</option>
                </Select>
              </FormRow>
            </Column>
          </div>
          <div tw="border-top[1px solid #ddd] mt-sm flex justify-content[flex-end] padding[16px 8px 8px 0]">
            <Button tw="px-md">
              <FontAwesomeIcon icon={faPlus} tw="mr-sm" />
              Ajouter
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Add;
