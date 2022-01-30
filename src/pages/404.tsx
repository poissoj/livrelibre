import { Title } from "@/components/Title";
import "twin.macro";

const Custom404 = (): JSX.Element => (
  <div tw="flex-1 self-center text-center text-2xl">
    <Title>Page introuvable</Title>
    <h1 tw="font-bold">Erreur 404</h1>
    <span>Page introuvable</span>
  </div>
);

export default Custom404;
