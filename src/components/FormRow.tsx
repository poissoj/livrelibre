import tw from "twin.macro";

const Label = tw.label`flex cursor-pointer mb-md items-center`;
const RowLabel = tw.span`text-right mr-lg font-medium w-1/4 flex-shrink-0 whitespace-nowrap`;
const Wrapper = tw.div`flex w-2/3`;

type FormRowProps = {
  label: string;
  children: React.ReactNode;
};
export const FormRow = ({ label, children }: FormRowProps): JSX.Element => (
  <Label>
    <RowLabel>{label}</RowLabel>
    <Wrapper>{children}</Wrapper>
  </Label>
);
