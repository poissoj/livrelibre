import useUser from "@/lib/useUser";
import { trpc } from "@/utils/trpc";
import { faShoppingCart, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/router";
import tw, { styled } from "twin.macro";
import { QuickSearch } from "./QuickSearch";

const StyledLink = styled.a({
  ...tw`bg-primary-dark text-white w-56 block text-center`,
  fontFamily: "Niconne",
  fontSize: "26px",
  lineHeight: "50px",
});

const UserName = ({ className }: { className?: string }) => {
  const { user } = useUser();
  return (
    <span className={className} tw="text-white">
      {user?.name || ""}
    </span>
  );
};

const StyledButton = tw.button`text-white padding[14px 16px] hover:background-color[rgba(0,0,0,0.1)]`;

const Logout = () => {
  const utils = trpc.useContext();
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    await utils.invalidateQueries(["user"]);
    void router.push("/login");
  };
  return (
    <StyledButton type="button" onClick={logout} title="Se déconnecter">
      <FontAwesomeIcon icon={faUser} />
    </StyledButton>
  );
};

const Badge = tw.span`border-radius[10rem] bg-gray-dark  px-2 py-0.5 font-size[12px] font-medium`;

const CartBadge = () => {
  const result = trpc.useQuery(["cart"]);
  if (result.status === "success" && result.data.count > 0) {
    return <Badge>{result.data.count}</Badge>;
  }
  return null;
};

const CartButton = () => (
  <Link href="/cart" passHref>
    <StyledButton as="a">
      <FontAwesomeIcon icon={faShoppingCart} />
      <CartBadge />
    </StyledButton>
  </Link>
);

export const Header = (): JSX.Element => {
  return (
    <header tw="bg-primary-default text-gray-darker flex items-center pr-lg">
      <Link href="/" passHref>
        <StyledLink>{process.env.NEXT_PUBLIC_APP_NAME}</StyledLink>
      </Link>
      <QuickSearch />
      <UserName tw="ml-auto mr-sm" />
      <CartButton />
      <Logout />
    </header>
  );
};
