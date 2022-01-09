import { ErrorBoundary } from "react-error-boundary";
import tw, { styled } from "twin.macro";
import { ErrorMessage } from "@/components/ErrorMessage";

type CardProps = {
  title?: string;
  className?: string;
  children: React.ReactNode;
  subtitle?: React.ReactNode;
  BodyWrapper?: React.FunctionComponent;
};

const SHADOW = `
0 2px 2px 0 rgba(0, 0, 0, 0.14),
0 1px 5px 0 rgba(0, 0, 0, 0.12),
0 3px 1px -2px rgba(0, 0, 0, 0.2)`;

const Wrapper = styled.section({
  ...tw`bg-white border-radius[4px] p-lg`,
  boxShadow: SHADOW,
});

const DefaultBodyWrapper = tw.div`mt-md overflow-auto flex align-items[flex-start]`;

export const Card = ({
  title,
  children,
  subtitle,
  className,
  BodyWrapper = DefaultBodyWrapper,
}: CardProps): JSX.Element => {
  return (
    <Wrapper className={className}>
      {title ? <h3 tw="text-2xl font-bold">{title}</h3> : null}
      {subtitle}
      <BodyWrapper>
        <ErrorBoundary FallbackComponent={ErrorMessage}>
          {children}
        </ErrorBoundary>
      </BodyWrapper>
    </Wrapper>
  );
};
