import {
  faCheckCircle,
  faDownload,
  faSpinner,
  faTimesCircle,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { createContext, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import "twin.macro";
import { z } from "zod";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Card, CardBody, CardFooter, CardTitle } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Title } from "@/components/Title";
import type { DilicomRow } from "@/utils/dilicomItem";
import { formatNumber, formatPrice } from "@/utils/format";
import type { StrictReactNode } from "@/utils/strictReactNode";

type FormFields = {
  dilicom: FileList;
};

type TFile = { filename: string; data: DilicomRow[] } | null;
type FileContextValue = [TFile, React.Dispatch<React.SetStateAction<TFile>>];

const FileContext = createContext<FileContextValue | undefined>(undefined);

const FileProvider = ({ children }: { children: StrictReactNode }) => {
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

const DilicomForm = ({ children }: { children: StrictReactNode }) => {
  const methods = useForm<FormFields>();
  const [, setFile] = useFileContext();
  const submit = async ({ dilicom }: FormFields) => {
    if (dilicom.length !== 1) return;
    const formData = new FormData();
    formData.append("dilicom", dilicom[0]);
    const response = await fetch("/api/importFile", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      methods.setError("dilicom", {
        message: "Erreur lors du traitement du fichier",
      });
      return;
    }
    const data = (await response.json()) as DilicomRow[];
    setFile({ filename: dilicom[0].name, data });
  };
  return (
    <FormProvider {...methods}>
      <form
        tw="flex flex-col w-full"
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
      tw="ml-2"
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
  const hasFile = file?.length > 0;
  return (
    <Button tw="px-4" type="submit" disabled={isSubmitting || !hasFile}>
      <FontAwesomeIcon
        icon={isSubmitting ? faSpinner : faUpload}
        spin={isSubmitting}
        tw="mr-2"
      />
      {isSubmitting ? "Traitement…" : "Envoyer"}
    </Button>
  );
};

const zError = z.object({ message: z.string() });
const FormErrors = () => {
  const {
    clearErrors,
    formState: { errors },
  } = useFormContext();
  const error = zError.safeParse(errors.dilicom);
  if (!error.success) return null;
  return (
    <Alert type="error" onDismiss={() => clearErrors()}>
      {error.data.message}
    </Alert>
  );
};

const DilicomImport = () => (
  <Card>
    <CardTitle>Importer un fichier DILICOM</CardTitle>
    <DilicomForm>
      <CardBody tw="flex flex-col gap-sm">
        <label>
          Fichier :
          <FileInput />
        </label>
        <FormErrors />
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
      <Button as="a" tw="px-4 inline-block" href="/api/export" download>
        <FontAwesomeIcon icon={faDownload} tw="mr-2" />
        Télécharger
      </Button>
    </CardFooter>
  </Card>
);

const DilicomTable = ({ items }: { items: DilicomRow[] }) => {
  return (
    <table tw="flex-1 border-separate border-spacing[0.5rem]">
      <thead>
        <tr tw="sticky top-0 bg-white z-10">
          <th tw="text-left">EAN</th>
          <th tw="text-left">Titre</th>
          <th tw="text-left">Auteur</th>
          <th tw="text-left">Éditeur</th>
          <th tw="text-left">Distributeur</th>
          <th tw="text-right">Prix</th>
          <th tw="text-right">Quantité</th>
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
            <td tw="text-right font-number">{formatPrice(item.PRIX)}</td>
            <td tw="text-right font-number">{formatNumber(item.QTE)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const DilicomPage = () => {
  const [file, setFile] = useFileContext();
  if (!file) {
    return (
      <Card>
        <CardTitle>Import de fichier</CardTitle>
        <CardBody>
          <ErrorMessage error={new Error("Fichier introuvable")} />
        </CardBody>
      </Card>
    );
  }
  return (
    <Card tw="self-start max-h-full flex flex-col flex-1">
      <CardTitle>Import du fichier {file.filename}</CardTitle>
      <CardBody tw="flex flex-col">
        <DilicomTable items={file.data} />
      </CardBody>
      <CardFooter tw="flex justify-end">
        <Button
          type="button"
          tw="mr-2 px-md background-color[#6E6E6E]"
          onClick={() => setFile(null)}
        >
          <FontAwesomeIcon icon={faTimesCircle} tw="mr-sm" />
          Annuler
        </Button>
        <Button type="submit" tw="px-md">
          <FontAwesomeIcon icon={faCheckCircle} tw="mr-sm" />
          Valider
        </Button>
      </CardFooter>
    </Card>
  );
};

const Advanced = (): JSX.Element => {
  const [file] = useFileContext();

  if (file) {
    return <DilicomPage />;
  }

  return (
    <div tw="margin-left[10%] margin-right[10%] flex flex-1 flex-col gap-lg">
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
