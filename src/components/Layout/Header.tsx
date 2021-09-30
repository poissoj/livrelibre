import Link from "next/link";
import "twin.macro";
import tw, { styled } from "twin.macro";

const StyledLink = styled.a({
  ...tw`bg-primary-dark text-white w-56 block text-center`,
  fontFamily: "Niconne",
  fontSize: "26px",
  lineHeight: "50px",
});

export const Header = (): JSX.Element => {
  return (
    <header tw="bg-primary-default text-gray-darker">
      <Link href="/" passHref>
        <StyledLink>{process.env.NEXT_PUBLIC_APP_NAME}</StyledLink>
      </Link>
    </header>
  );
};
