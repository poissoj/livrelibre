import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import { Input, Select, Textarea } from "@/components/FormControls";
import { Title } from "@/components/Title";
import { FormRow } from "@/components/FormRow";
import { Button } from "@/components/Button";
import tw from "twin.macro";
import { ITEM_TYPES } from "@/utils/item";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

const Column = tw.div`flex-1 min-width[20rem] ml-md`;

const Search = (): JSX.Element => {
  const { register, handleSubmit } = useForm();
  const router = useRouter();
  const onSubmit = (data: Record<string, string>) => {
    void router.push({ pathname: "/advancedSearch", query: data });
  };
  return (
    <div tw="margin-left[10%] margin-right[10%] flex-1">
      <Title>Chercher un article</Title>
      <Card tw="mb-lg">
        <CardTitle>Chercher un article</CardTitle>
        <form tw="flex-1" onSubmit={handleSubmit(onSubmit)}>
          <CardBody tw="flex-col">
            <div tw="flex flex-wrap">
              <Column>
                <FormRow label="Type">
                  <Select defaultValue="" {...register("type")}>
                    <option value="">--ignorer--</option>
                    {Object.entries(ITEM_TYPES).map(([key, label]) => (
                      <option value={key} key={key}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </FormRow>
                <FormRow label="ISBN">
                  <Input type="text" maxLength={13} {...register("isbn")} />
                </FormRow>
                <FormRow label="Auteur">
                  <Input type="text" {...register("author")} />
                </FormRow>
                <FormRow label="Titre">
                  <Input type="text" {...register("title")} />
                </FormRow>
                <FormRow label="Éditeur">
                  <Input type="text" {...register("publisher")} />
                </FormRow>
                <FormRow label="Distributeur">
                  <Input type="text" {...register("distributor")} />
                </FormRow>
                <FormRow label="Mots-clés">
                  <Input type="text" {...register("keywords")} />
                </FormRow>
              </Column>
              <Column>
                <FormRow label="Date d&rsquo;achat">
                  <Input type="text" {...register("datebought")} />
                </FormRow>
                <FormRow label="Commentaires">
                  <Textarea {...register("comments")} />
                </FormRow>
                <FormRow label="Prix d&rsquo;achat">
                  <Input
                    type="number"
                    {...register("purchasePrice")}
                    min={0}
                    step={0.01}
                    tw="font-mono"
                  />
                </FormRow>
                <FormRow label="Prix de vente">
                  <Input
                    type="number"
                    {...register("price")}
                    min={0}
                    step={0.01}
                    tw="font-mono"
                  />
                </FormRow>
                <FormRow label="Quantité">
                  <Input
                    type="number"
                    {...register("amount")}
                    min={0}
                    tw="font-mono"
                  />
                </FormRow>
                <FormRow label="TVA">
                  <Select {...register("tva")} defaultValue="" tw="font-mono">
                    <option value="">--ignorer--</option>
                    <option value="20">20.0%</option>
                    <option value="5.5">5.5%</option>
                    <option value="2.1">2.1%</option>
                    <option value="0">0.0%</option>
                  </Select>
                </FormRow>
              </Column>
            </div>
            <CardFooter tw="flex justify-end">
              <Button type="submit" tw="px-md">
                <FontAwesomeIcon icon={faSearch} tw="mr-sm" />
                Rechercher
              </Button>
            </CardFooter>
          </CardBody>
        </form>
      </Card>
    </div>
  );
};

export default Search;
