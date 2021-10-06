import "twin.macro";
import tw, { styled } from "twin.macro";
type CardProps = {
  title: string;
  className?: string;
  children: React.ReactNode;
};

const SHADOW = `
0 2px 2px 0 rgba(0, 0, 0, 0.14),
0 1px 5px 0 rgba(0, 0, 0, 0.12),
0 3px 1px -2px rgba(0, 0, 0, 0.2)`;

const Wrapper = styled.section({
  ...tw`bg-white border-radius[4px] p-lg`,
  boxShadow: SHADOW,
});

export const Card = ({
  title,
  children,
  className,
}: CardProps): JSX.Element => {
  return (
    <Wrapper className={className}>
      <h3 tw="text-2xl font-bold mb-lg">{title}</h3>
      <div tw="overflow-auto">{children}</div>
    </Wrapper>
  );
};
