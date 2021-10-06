import tw, { styled } from "twin.macro";

const formControl = tw`border-radius[3px] padding[8px 12px] w-full focus:(border-primary-default outline-none)
  border[2px solid #ccc] transition[border-color ease-in-out 0.15s]`;

export const Input = styled.input`
  ${formControl}
`;

export const InputWithButton = tw(
  Input
)`border-top-right-radius[0] border-bottom-right-radius[0]`;

export const Select = styled.select`
  ${formControl}
`;

export const Textarea = styled.textarea`
  ${formControl}
`;
