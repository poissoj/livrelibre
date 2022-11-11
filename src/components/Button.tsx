import tw, { styled } from "twin.macro";

const transition = `
    box-shadow 0.3s cubic-bezier(0.35, 0, 0.25, 1),
    transform 0.2s cubic-bezier(0.35, 0, 0.25, 1),
`;

export const Button = styled.button({
  ...tw`bg-primary-dark text-white [border-radius:3px] p-sm uppercase tracking-wide font-medium text-sm whitespace-nowrap`,
  transition,
  "&[disabled]": tw`cursor-not-allowed [opacity:0.65]`,
  "&:not([disabled]):hover, &:focus": {
    outline: "none",
    transform: "translate3d(0, -1px, 0)",
    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.4)",
  },
});

export const ButtonWithInput = styled(Button)`
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  margin-left: -1px;
`;
