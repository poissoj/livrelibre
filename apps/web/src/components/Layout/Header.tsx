import { faShoppingCart, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx } from "clsx";
import type { ReactElement } from "react";
import { Link, useNavigate } from "react-router";

import { APP_NAME } from "@/lib/config";
import useUser from "@/lib/useUser";
import { trpc } from "@/utils/trpc";

import { QuickSearch } from "./QuickSearch";

const UserName = ({ className }: { className?: string }) => {
  const { user } = useUser();
  return (
    <span className={clsx("text-white", className)}>{user?.name || ""}</span>
  );
};

const BUTTON_STYLES =
  "text-white [padding:14px_16px] hover:[background-color:rgba(0,0,0,0.1)]";

const Logout = () => {
  const utils = trpc.useUtils();
  const navigate = useNavigate();
  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    await utils.user.reset();
    void navigate("/login");
  };
  return (
    <button
      className={BUTTON_STYLES}
      type="button"
      onClick={logout}
      title="Se déconnecter"
    >
      <FontAwesomeIcon icon={faUser} />
    </button>
  );
};

const CartBadge = () => {
  const result = trpc.cart.useQuery();
  if (result.status === "success" && result.data.count > 0) {
    return (
      <span className="[border-radius:10rem] bg-gray-dark  px-2 py-0.5 [font-size:12px] font-medium">
        {result.data.count}
      </span>
    );
  }
  return null;
};

const CartButton = () => (
  <Link
    to="/cart"
    className={clsx(BUTTON_STYLES, "shrink-0")}
    title="Voir le panier"
  >
    <FontAwesomeIcon icon={faShoppingCart} />
    <CartBadge />
  </Link>
);

export const Header = (): ReactElement => {
  return (
    <header className="bg-primary-dark text-gray-darker flex items-center pr-lg">
      <Link
        to="/"
        className="bg-primary-dark text-white w-56 block text-center mr-auto font-['Niconne'] text-[26px] leading-[50px]"
      >
        {APP_NAME}
      </Link>
      <QuickSearch />
      <UserName className="ml-md mr-sm" />
      <CartButton />
      <Logout />
    </header>
  );
};
