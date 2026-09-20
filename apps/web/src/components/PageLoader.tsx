import { faRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ReactElement } from "react";

export const PageLoader = (): ReactElement => (
  <div className="flex h-full items-center justify-center">
    <FontAwesomeIcon icon={faRotate} spin size="2x" />
  </div>
);
