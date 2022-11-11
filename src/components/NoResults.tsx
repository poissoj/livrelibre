import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import tw from "twin.macro";

const Alert = tw.div`p-sm [border:1px solid #bee5eb] [color:#0c5460] [background-color:#d1ecf1] self-start`;

export const NoResults = (): JSX.Element => {
  return (
    <Alert>
      <p tw="mb-sm">
        <FontAwesomeIcon icon={faInfoCircle} tw="mr-sm" />
        Aucun résultat.
      </p>
    </Alert>
  );
};
