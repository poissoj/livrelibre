import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

import { Button } from "@/components/Button";
import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import { Input, Select, Textarea } from "@/components/FormControls";
import { FormRow } from "@/components/FormRow";
import { Title } from "@/components/Title";
import { formatTVA } from "@/utils/format";
import { ITEM_TYPES, TVAValues } from "@/utils/item";

const Column = ({ children }: React.PropsWithChildren) => (
  <div className="flex-1 [min-width:20rem] ml-md">{children}</div>
);

const Search = (): JSX.Element => {
  const { register, handleSubmit } = useForm();
  const router = useRouter();
  const onSubmit = (data: Record<string, string>) => {
    const datebought = data.datebought.split("-").reverse().join("/");
    const query = { ...data, datebought };
    void router.push({ pathname: "/advancedSearch", query });
  };
  return (
    <div className="[margin-left:10%] [margin-right:10%] flex-1">
      <Title>Chercher un article</Title>
      <Card className="mb-lg">
        <CardTitle>Chercher un article</CardTitle>
        <form className="flex-1" onSubmit={handleSubmit(onSubmit)}>
          <CardBody className="flex-col">
            <div className="flex flex-wrap">
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
                  <Input type="date" {...register("datebought")} />
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
                    className="font-number"
                  />
                </FormRow>
                <FormRow label="Prix de vente">
                  <Input
                    type="number"
                    {...register("price")}
                    min={0}
                    step={0.01}
                    className="font-number"
                  />
                </FormRow>
                <FormRow label="Quantité">
                  <Input
                    type="number"
                    {...register("amount")}
                    min={0}
                    className="font-number"
                  />
                </FormRow>
                <FormRow label="TVA">
                  <Select
                    {...register("tva")}
                    defaultValue=""
                    className="font-number"
                  >
                    <option value="">--ignorer--</option>
                    {TVAValues.map((value) => (
                      <option value={value} key={value}>
                        {formatTVA(value)}
                      </option>
                    ))}
                  </Select>
                </FormRow>
              </Column>
            </div>
            <CardFooter className="flex justify-end">
              <Button type="submit" className="px-md">
                <FontAwesomeIcon icon={faSearch} className="mr-sm" />
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
