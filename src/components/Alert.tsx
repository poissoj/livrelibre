import {
  faCheckCircle,
  faExclamationCircle,
  faExclamationTriangle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import tw from "twin.macro";

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

export const Alert = ({
  children,
  className,
  onDismiss,
  type,
}: {
  type: "success" | "warning" | "error";
  children: React.ReactNode;
  className?: string;
  onDismiss?(): void;
}): JSX.Element | null => {
  const onClick = () => {
    onDismiss?.();
  };
  const AlertWrapper = {
    success: AlertSuccess,
    warning: AlertWarning,
    error: AlertDanger,
  }[type];
  const icon = {
    success: faCheckCircle,
    warning: faExclamationTriangle,
    error: faExclamationCircle,
  }[type];
  return (
    <AlertWrapper className={className}>
      <FontAwesomeIcon icon={icon} tw="mr-sm" />
      {children}
      <button
        type="button"
        onClick={onClick}
        tw="ml-auto p-2"
        aria-label="Fermer"
      >
        <FontAwesomeIcon icon={faTimes} size="lg" />
      </button>
    </AlertWrapper>
  );
};
