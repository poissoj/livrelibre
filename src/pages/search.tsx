import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { Card } from "@/components/Card";
import { Input, Select, Textarea } from "@/components/FormControls";
import { Title } from "@/components/Title";
import { FormRow } from "@/components/FormRow";
import { Button } from "@/components/Button";
import tw from "twin.macro";
import { ITEM_TYPES } from "@/utils/item";
import type { GetStaticProps } from "next";

const Column = tw.div`flex-1 min-width[20rem] ml-md`;

const Search = (): JSX.Element => {
  return (
    <div tw="margin-left[10%] margin-right[10%] flex-1">
      <Title>Chercher un article</Title>
      <Card title="Chercher un article" tw="mb-lg">
        <form tw="flex-1">
          <div tw="flex flex-wrap">
            <Column>
              <FormRow label="Type">
                <Select name="type" defaultValue="">
                  <option value="">--ignorer--</option>
                  {Object.entries(ITEM_TYPES).map(([key, label]) => (
                    <option value={key} key={key}>
                      {label}
                    </option>
                  ))}
                </Select>
              </FormRow>
              <FormRow label="ISBN">
                <Input type="text" name="isbn" maxLength={13} />
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
              <FontAwesomeIcon icon={faSearch} tw="mr-sm" />
              Rechercher
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Search;

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
