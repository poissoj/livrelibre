import "twin.macro";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { Button } from "@/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faUpload } from "@fortawesome/free-solid-svg-icons";

const DilicomImport = () => (
  <Card title="Importer un fichier DILICOM">
    <form tw="flex flex-col w-full">
      <label>
        Fichier :
        <input type="file" tw="ml-2" />
      </label>
      <div tw="border-t border-color[#ddd] pt-3 my-2">
        <Button tw="px-4" type="submit">
          <FontAwesomeIcon icon={faUpload} tw="mr-2" />
          Envoyer
        </Button>
      </div>
    </form>
  </Card>
);

const StockExport = () => (
  <Card title="Export du stock">
    <div tw="w-full">
      <p>Export du stock au format CSV</p>
      <div tw="border-t border-color[#ddd] pt-3 my-2">
        <Button as="a" tw="px-4" href="/api/export" download>
          <FontAwesomeIcon icon={faDownload} tw="mr-2" />
          Télécharger
        </Button>
      </div>
    </div>
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
