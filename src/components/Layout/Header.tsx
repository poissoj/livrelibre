import useUser from "@/lib/useUser";
import { trpc } from "@/utils/trpc";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/router";
import "twin.macro";
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

const Logout = () => {
  const utils = trpc.useContext();
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    await utils.invalidateQueries(["user"]);
    void router.push("/login");
  };
  return (
    <button
      type="button"
      onClick={logout}
      tw="text-white padding[14px] ml-sm hover:background-color[rgba(0, 0, 0, 0.1)]"
    >
      <FontAwesomeIcon icon={faUser} />
    </button>
  );
};

export const Header = (): JSX.Element => {
  return (
    <header tw="bg-primary-default text-gray-darker flex items-center pr-lg">
      <Link href="/" passHref>
        <StyledLink>{process.env.NEXT_PUBLIC_APP_NAME}</StyledLink>
      </Link>
      <QuickSearch />
      <UserName tw="ml-auto" />
      <Logout />
    </header>
  );
};
