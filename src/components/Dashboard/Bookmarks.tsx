import { Card } from "@/components/Card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus, faStar } from "@fortawesome/free-solid-svg-icons";
import "twin.macro";

const bookmarks = [
  "Carte Alma Kaiser",
  "Carte Cartes d'art",
  "Carte Douce France",
  "Carte Alma Kaiser",
  "Carte Cartes d'art",
  "Carte Douce France",
  "Carte Alma Kaiser",
  "Carte Cartes d'art",
  "Carte Douce France",
  "Carte Alma Kaiser",
  "Carte Cartes d'art",
  "Carte Douce France",
  "Carte Alma Kaiser",
  "Carte Cartes d'art",
  "Carte Douce France",
  "Carte Alma Kaiser",
  "Carte Cartes d'art",
  "Carte Douce France",
  "Carte Alma Kaiser",
  "mini Carte + enveloppe porte-vent porte vent",
  "Carte Douce France",
  "Carte Alma Kaiser",
  "Carte Cartes d'art",
];

export const Bookmarks = (): JSX.Element => (
  <Card title="Favoris" tw="flex-1 max-h-full overflow-hidden flex flex-col">
    <ul>
      {bookmarks.map((label, i) => (
        <li key={i} tw="flex text-primary-dark hover:bg-gray-light pl-sm pr-xs">
          <span tw="flex flex-1 align-items[center] text-primary-darkest">
            <a href={`#${label}`}>{label}</a>
          </span>
          <button
            tw="p-xs mr-xs"
            name="Ajouter au panier"
            title="Ajouter au panier"
          >
            <FontAwesomeIcon icon={faCartPlus} />
          </button>
          <button
            tw="p-xs"
            name="Enlever des favoris"
            title="Enlever des favoris"
          >
            <FontAwesomeIcon icon={faStar} />
          </button>
        </li>
      ))}
    </ul>
  </Card>
);
