import {
  faBook,
  faChartLine,
  faChartPie,
  faEdit,
  faFileAlt,
  faLaptop,
  faSearchPlus,
  faTachometerAlt,
  faThList,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import {
  FontAwesomeIcon,
  type FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { clsx } from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";

import useUser from "@/lib/useUser";

type NavLinkProps = {
  href: string;
  icon: FontAwesomeIconProps["icon"];
  children: React.ReactNode;
};
const NavLink = ({ href, icon, children }: NavLinkProps) => {
  const router = useRouter();
  const ariaCurrent = router.pathname === href ? "page" : undefined;
  return (
    <Link
      href={href}
      aria-current={ariaCurrent}
      className={clsx(
        "block p-md transition-colors duration-300 ease-out border-l-4",
        "hover:bg-gray-darkest",
        "focus:outline-none focus:bg-gray-darkest",
        ariaCurrent ? "border-primary-default" : "border-transparent",
      )}
    >
      <FontAwesomeIcon icon={icon} className="mr-sm" fixedWidth />
      {children}
    </Link>
  );
};

export const Sidebar = (): JSX.Element => {
  const { user } = useUser();
  const salesPage = user?.role === "admin" ? "/sales" : "/todaySales";
  return (
    <nav className="w-56 bg-gray-default text-white">
      <ul>
        <li>
          <NavLink href="/" icon={faTachometerAlt}>
            Tableau de bord
          </NavLink>
        </li>
        <li>
          <NavLink href="/search" icon={faSearchPlus}>
            Recherche avancée
          </NavLink>
        </li>
        <li>
          <NavLink href="/add" icon={faEdit}>
            Ajouter un article
          </NavLink>
        </li>
        <li>
          <NavLink href={salesPage} icon={faThList}>
            Ventes
          </NavLink>
        </li>
        <li>
          <hr className="mx-lg my-md" />
        </li>
        <li>
          <NavLink href="/items" icon={faFileAlt}>
            Articles
          </NavLink>
        </li>
        <li>
          <NavLink href="/best-sales" icon={faChartLine}>
            Meilleures ventes
          </NavLink>
        </li>
        <li>
          <NavLink href="/stats" icon={faChartPie}>
            Statistiques
          </NavLink>
        </li>
        <li>
          <NavLink href="/customers" icon={faUsers}>
            Client⋅es
          </NavLink>
        </li>
        <li>
          <NavLink href="/orders" icon={faBook}>
            Commandes
          </NavLink>
        </li>
        <li>
          <NavLink href="/advanced" icon={faLaptop}>
            Avancé…
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};
