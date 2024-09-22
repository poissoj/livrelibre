import {
  faCheckCircle,
  faDownload,
  faSpinner,
  faTimesCircle,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { type ReactElement, createContext, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { toast } from "react-toastify";

import { Button, ButtonAnchor } from "@/components/Button";
import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import { Title } from "@/components/Title";
import type { DilicomRowWithId } from "@/utils/dilicomItem";
import { formatNumber, formatPrice } from "@/utils/format";

type FormFields = {
  dilicom: FileList | undefined;
};

type TFile = { filename: string; data: DilicomRowWithId[] } | null;
type FileContextValue = [TFile, React.Dispatch<React.SetStateAction<TFile>>];

const FileContext = createContext<FileContextValue | undefined>(undefined);

const FileProvider = ({ children }: { children: React.ReactNode }) => {
  const fileState = useState<TFile>(null);
  return (
    <FileContext.Provider value={fileState}>{children}</FileContext.Provider>
  );
};

const useFileContext = () => {
  const context = React.useContext(FileContext);
  if (!context) {
    throw new Error("useFileContext must be used within a FileProvider");
  }
  return context;
};

const DilicomForm = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm<FormFields>();
  const [, setFile] = useFileContext();
  const submit = async ({ dilicom }: FormFields) => {
    if (!dilicom || dilicom.length !== 1) return;
    const formData = new FormData();
    formData.append("dilicom", dilicom[0]);
    const response = await fetch("/api/importFile", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const json = (await response.json()) as { error: string };
      toast.error(json.error);
      return;
    }
    const data = (await response.json()) as DilicomRowWithId[];
    setFile({ filename: dilicom[0].name, data });
  };
  return (
    <FormProvider {...methods}>
      <form
        className="flex flex-col w-full"
        method="post"
        onSubmit={methods.handleSubmit(submit)}
      >
        {children}
      </form>
    </FormProvider>
  );
};

const FileInput = () => {
  const { register } = useFormContext<FormFields>();
  return (
    <input
      type="file"
      className="ml-2"
      accept=".csv, .slk, .xlsx"
      {...register("dilicom")}
    />
  );
};

const SubmitButton = () => {
  const {
    formState: { isSubmitting },
    watch,
  } = useFormContext<FormFields>();
  const file = watch("dilicom");
  const hasFile = file && file.length > 0;
  return (
    <Button className="px-4" type="submit" disabled={isSubmitting || !hasFile}>
      <FontAwesomeIcon
        icon={isSubmitting ? faSpinner : faUpload}
        spin={isSubmitting}
        className="mr-2"
      />
      {isSubmitting ? "Traitement…" : "Envoyer"}
    </Button>
  );
};

const DilicomImport = () => (
  <Card>
    <CardTitle>Importer un fichier DILICOM</CardTitle>
    <DilicomForm>
      <CardBody className="flex flex-col gap-sm">
        <label>
          Fichier :
          <FileInput />
        </label>
      </CardBody>
      <CardFooter>
        <SubmitButton />
      </CardFooter>
    </DilicomForm>
  </Card>
);

const StockExport = () => (
  <Card>
    <CardTitle>Export du stock</CardTitle>
    <CardBody>
      <p>Export du stock au format CSV</p>
    </CardBody>
    <CardFooter>
      <ButtonAnchor className="px-4 inline-block" href="/api/export" download>
        <FontAwesomeIcon icon={faDownload} className="mr-2" />
        Télécharger
      </ButtonAnchor>
    </CardFooter>
  </Card>
);

const DilicomTable = ({ items }: { items: DilicomRowWithId[] }) => {
  return (
    <table className="flex-1 border-separate [border-spacing:0.5rem]">
      <thead>
        <tr className="sticky top-0 bg-white z-10">
          <th className="text-left">EAN</th>
          <th className="text-left">Titre</th>
          <th className="text-left">Auteur·ice</th>
          <th className="text-left">Maison d&apos;édition</th>
          <th className="text-left">Distributeur</th>
          <th className="text-right">Stock</th>
          <th className="text-right">Prix</th>
          <th className="text-right">Quantité</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i}>
            <td>{item.EAN}</td>
            <td>{item.TITRE}</td>
            <td>{item.AUTEUR}</td>
            <td>{item.EDITEUR}</td>
            <td>{item.DISTRIBUTEUR}</td>
            <td className="text-right">
              {item.amount == null ? (
                "Nouveau"
              ) : (
                <span className="font-number">{formatNumber(item.amount)}</span>
              )}
            </td>
            <td className="text-right font-number">{formatPrice(item.PRIX)}</td>
            <td className="text-right font-number">{formatNumber(item.QTE)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const ImportBooks = ({
  books,
  children,
}: {
  books: DilicomRowWithId[];
  children: React.ReactNode;
}) => {
  const [, setFile] = useFileContext();
  const [isLoading, setIsLoading] = useState(false);
  const submit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const response = await fetch("/api/finalizeImport", {
      method: "POST",
      body: JSON.stringify(books),
    });
    setIsLoading(false);
    if (!response.ok) {
      toast.error("Erreur lors de l'import");
      return;
    }
    toast.success(
      `Le fichier a été importé correctement (${books.length} article${
        books.length > 1 ? "s" : ""
      }).`,
    );
    setFile(null);
  };
  return (
    <form onSubmit={submit}>
      {children}
      <Button type="submit" className="px-md" disabled={isLoading}>
        <FontAwesomeIcon icon={faCheckCircle} className="mr-sm" />
        Valider
      </Button>
    </form>
  );
};

const DilicomPage = () => {
  const [file, setFile] = useFileContext();
  if (!file) {
    throw new Error("Unable to find file - should never happen");
  }
  const nbItems = file.data.reduce((nb, row) => nb + row.QTE, 0);

  return (
    <Card className="self-start max-h-full flex flex-col flex-1">
      <CardTitle>Import du fichier {file.filename}</CardTitle>
      <CardBody className="flex flex-col">
        <DilicomTable items={file.data} />
      </CardBody>
      <CardFooter className="flex">
        <span className="font-bold mr-auto">
          Total: <span className="font-number">{formatNumber(nbItems)}</span>{" "}
          articles
        </span>
        <ImportBooks books={file.data}>
          <Button
            type="button"
            className="mr-2 px-md [background-color:#6E6E6E]"
            onClick={() => {
              setFile(null);
            }}
          >
            <FontAwesomeIcon icon={faTimesCircle} className="mr-sm" />
            Annuler
          </Button>
        </ImportBooks>
      </CardFooter>
    </Card>
  );
};

const Advanced = (): ReactElement => {
  const [file] = useFileContext();

  if (file) {
    return <DilicomPage />;
  }

  return (
    <div className="[margin-left:10%] [margin-right:10%] flex flex-1 flex-col gap-lg">
      <Title>Avancé</Title>
      <DilicomImport />
      <StockExport />
    </div>
  );
};

const AdvancedWrapper = () => (
  <FileProvider>
    <Advanced />
  </FileProvider>
);

export default AdvancedWrapper;
