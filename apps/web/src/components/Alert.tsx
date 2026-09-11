import * as React from "react";
import {
  faCheckCircle,
  faExclamationCircle,
  faExclamationTriangle,
  faInfoCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx } from "clsx";

const BasicAlert = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={clsx("p-sm border rounded flex items-center", className)}>
    {children}
  </div>
);

const ALERT_STYLES = {
  success: "[color:#0f5132] [border-color:#badbcc] [background-color:#d1e7dd]",
  warning: "[color:#664d03] [border-color:#ffecb5] [background-color:#fff3cd]",
  error: "[color:#842029] [border-color:#f5c2c7] [background-color:#f8d7da]",
  info: "[color:#055160] [border-color:#b6effb] [background-color:#cff4fc]",
};

export const Alert = ({
  children,
  className,
  onDismiss,
  type,
}: {
  type: "success" | "warning" | "error" | "info";
  children: React.ReactNode;
  className?: string;
  onDismiss?: () => void;
}): React.ReactElement | null => {
  const style = clsx(ALERT_STYLES[type], className);
  const icon = {
    success: faCheckCircle,
    warning: faExclamationTriangle,
    error: faExclamationCircle,
    info: faInfoCircle,
  }[type];
  return (
    <BasicAlert className={style}>
      <FontAwesomeIcon icon={icon} className="mr-sm" />
      {children}
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-auto p-2"
          aria-label="Fermer"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>
      ) : null}
    </BasicAlert>
  );
};
