import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import tw from "twin.macro";

const Alert = tw.div`p-sm border[1px solid #f5c6cb] color[#721c24] background-color[#f8d7da] align-self[flex-start]`;

type Props = {
  error: Error;
};
export const ErrorMessage = ({ error }: Props): JSX.Element => {
  return (
    <Alert>
      <p tw="mb-sm">
        <FontAwesomeIcon icon={faExclamationCircle} tw="mr-sm" />
        Une erreur est survenue.
      </p>
      <pre>{error.message}</pre>
    </Alert>
  );
};
