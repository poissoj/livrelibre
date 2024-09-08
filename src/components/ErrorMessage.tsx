import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ReactElement } from "react";

const DEFAULT_ERROR = new Error("Impossible de récupérer les données");
type Props = {
  error?: Error;
};
export const ErrorMessage = ({
  error = DEFAULT_ERROR,
}: Props): ReactElement => {
  return (
    <div className="p-sm [border:1px_solid_#f5c6cb] [color:#721c24] [background-color:#f8d7da] self-start">
      <p className="mb-sm">
        <FontAwesomeIcon icon={faExclamationCircle} className="mr-sm" />
        Une erreur est survenue.
      </p>
      <pre>{error.message}</pre>
    </div>
  );
};
