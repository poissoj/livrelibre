import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ReactElement } from "react";

export const NoResults = (): ReactElement => {
  return (
    <div className="p-sm [border:1px_solid_#bee5eb] [color:#0c5460] [background-color:#d1ecf1] self-start">
      <p className="mb-sm">
        <FontAwesomeIcon icon={faInfoCircle} className="mr-sm" />
        Aucun résultat.
      </p>
    </div>
  );
};
