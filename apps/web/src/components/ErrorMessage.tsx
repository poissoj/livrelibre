import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ReactElement } from "react";

import { getErrorMessage } from "@/utils/errors";

type Props = {
  error?: unknown;
};
export const ErrorMessage = ({ error }: Props): ReactElement => {
  const message = getErrorMessage(error, "Impossible de récupérer les données");
  return (
    <div className="p-sm [border:1px_solid_#f5c6cb] [color:#721c24] [background-color:#f8d7da] self-start">
      <p className="mb-sm">
        <FontAwesomeIcon icon={faExclamationCircle} className="mr-sm" />
        Une erreur est survenue.
      </p>
      <pre>{message}</pre>
    </div>
  );
};
