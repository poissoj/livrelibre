import "twin.macro";
import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import { Title } from "@/components/Title";
import { Button } from "@/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faUpload } from "@fortawesome/free-solid-svg-icons";

const DilicomImport = () => (
  <Card>
    <CardTitle>Importer un fichier DILICOM</CardTitle>
    <form tw="flex flex-col w-full">
      <CardBody>
        <label>
          Fichier :
          <input type="file" tw="ml-2" />
        </label>
      </CardBody>
      <CardFooter>
        <Button tw="px-4" type="submit">
          <FontAwesomeIcon icon={faUpload} tw="mr-2" />
          Envoyer
        </Button>
      </CardFooter>
    </form>
  </Card>
);

const StockExport = () => (
  <Card>
    <CardTitle>Export du stock</CardTitle>
    <CardBody>
      <p>Export du stock au format CSV</p>
    </CardBody>
    <CardFooter>
      <Button as="a" tw="px-4 inline-block" href="/api/export" download>
        <FontAwesomeIcon icon={faDownload} tw="mr-2" />
        Télécharger
      </Button>
    </CardFooter>
  </Card>
);

const Advanced = (): JSX.Element => {
  return (
    <div tw="margin-left[10%] margin-right[10%] flex flex-1 flex-col gap-lg">
      <Title>Avancé</Title>
      <DilicomImport />
      <StockExport />
    </div>
  );
};

export default Advanced;
