import {
  faChartLine,
  faChartPie,
  faEdit,
  faFileAlt,
  faLaptop,
  faSearchPlus,
  faTachometerAlt,
  faThList,
} from "@fortawesome/free-solid-svg-icons";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/router";
import tw, { styled } from "twin.macro";

const StyledLink = styled.a({
  ...tw`block p-md transition-colors duration-300 ease-out border-l-4 border-transparent`,
  "&:hover, &:focus, &[aria-current]": tw`border-primary-default bg-gray-darkest`,
});

type NavLinkProps = {
  href: string;
  icon: FontAwesomeIconProps["icon"];
  children: React.ReactNode;
};
const NavLink = ({ href, icon, children }: NavLinkProps) => {
  const router = useRouter();
  const ariaCurrent = router.pathname === href ? "page" : undefined;
  return (
    <Link href={href} passHref>
      <StyledLink aria-current={ariaCurrent}>
        <FontAwesomeIcon icon={icon} tw="mr-sm" fixedWidth />
        {children}
      </StyledLink>
    </Link>
  );
};

export const Sidebar = (): JSX.Element => {
  return (
    <nav tw="w-56 bg-gray-default text-white">
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
          <NavLink href="/sales" icon={faThList}>
            Ventes
          </NavLink>
        </li>
        <li>
          <hr tw="mx-lg my-md" />
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
          <NavLink href="/advanced" icon={faLaptop}>
            Avancé…
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};
