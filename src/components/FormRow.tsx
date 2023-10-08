type FormRowProps = {
  label: string;
  children: React.ReactNode;
};
export const FormRow = ({ label, children }: FormRowProps): JSX.Element => (
  <label className="flex cursor-pointer mb-md items-center">
    <span className="text-right mr-lg font-medium w-1/4 flex-shrink-0 whitespace-nowrap">
      {label}
    </span>
    <div className="flex w-2/3">{children}</div>
  </label>
);
