import * as React from "react";
import { faRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "twin.macro";

export const LoadingOverlay = ({ children }: { children: React.ReactNode }) => (
  <>
    <div tw="flex flex-1 bg-white opacity-40">{children}</div>
    <FontAwesomeIcon
      icon={faRotate}
      spin
      tw="absolute inset-0 m-auto"
      size="2x"
    />
  </>
);
