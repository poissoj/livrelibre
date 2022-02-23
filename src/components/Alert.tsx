import * as React from "react";
import {
  faCheckCircle,
  faExclamationCircle,
  faExclamationTriangle,
  faInfoCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import tw from "twin.macro";

import type { StrictReactNode } from "@/utils/strictReactNode";

const BasicAlert = tw.div`p-sm border border-radius[4px] flex items-center`;

const AlertSuccess = tw(
  BasicAlert
)`color[#0f5132] border-color[#badbcc] background-color[#d1e7dd]`;

const AlertWarning = tw(
  BasicAlert
)`color[#664d03] border-color[#ffecb5] background-color[#fff3cd]`;

const AlertDanger = tw(
  BasicAlert
)`color[#842029] border-color[#f5c2c7] background-color[#f8d7da]`;

const AlertInfo = tw(
  BasicAlert
)`color[#055160] border-color[#b6effb] background-color[#cff4fc]`;

export const Alert = ({
  children,
  className,
  onDismiss,
  type,
}: {
  type: "success" | "warning" | "error" | "info";
  children: StrictReactNode;
  className?: string;
  onDismiss?(): void;
}): JSX.Element | null => {
  const AlertWrapper = {
    success: AlertSuccess,
    warning: AlertWarning,
    error: AlertDanger,
    info: AlertInfo,
  }[type];
  const icon = {
    success: faCheckCircle,
    warning: faExclamationTriangle,
    error: faExclamationCircle,
    info: faInfoCircle,
  }[type];
  return (
    <AlertWrapper className={className}>
      <FontAwesomeIcon icon={icon} tw="mr-sm" />
      {children}
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          tw="ml-auto p-2"
          aria-label="Fermer"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>
      ) : null}
    </AlertWrapper>
  );
};
