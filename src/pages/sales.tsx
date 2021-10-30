import { Title } from "@/components/Title";
import { Card } from "@/components/Card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/Button";
import tw from "twin.macro";

const StickyTh = tw.th`sticky top-0 bg-white`;
const Cell = tw.td`text-center`;

const Sales = (): JSX.Element => {
  const data = Array(30).fill(0);
  return (
    <div tw="margin-left[10%] margin-right[10%] flex-1">
      <Title>Liste des ventes par mois</Title>
      <Card
        title="Liste des ventes par mois"
        tw="mb-lg max-h-full overflow-hidden flex flex-col"
      >
        <table tw="flex-1">
          <thead>
            <tr>
              <StickyTh>Mois</StickyTh>
              <StickyTh>Nombre de ventes</StickyTh>
              <StickyTh>Recette totale</StickyTh>
              <StickyTh>Panier moyen</StickyTh>
              <StickyTh></StickyTh>
            </tr>
          </thead>
          <tbody tw="line-height[2.3rem]">
            {data.map((_, i) => (
              <tr key={i}>
                <Cell>10/2021</Cell>
                <Cell>3</Cell>
                <Cell>12.5€</Cell>
                <Cell>6.25€</Cell>
                <Cell>
                  <Button
                    as="a"
                    href="/sale/10-2021"
                    tw="background-color[#666]"
                  >
                    <FontAwesomeIcon icon={faEye} tw="mr-sm" />
                    Détails
                  </Button>
                </Cell>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default Sales;
