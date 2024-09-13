import clsx from "clsx";
import type { ReactElement } from "react";

type FormRowProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
  fieldClass?: string;
};
export const FormRow = ({
  label,
  children,
  fieldClass,
}: FormRowProps): ReactElement => (
  <label className="flex cursor-pointer mb-md items-center">
    <span className="text-right mr-lg font-medium w-1/4 flex-shrink-0 whitespace-nowrap">
      {label}
    </span>
    <div className={clsx("flex w-2/3", fieldClass)}>{children}</div>
  </label>
);
