import type { ReactElement } from "react";

import { Title } from "@/components/Title";

const Custom404 = (): ReactElement => (
  <div className="flex-1 self-center text-center text-2xl">
    <Title>Page introuvable</Title>
    <h1 className="font-bold">Erreur 404</h1>
    <span>Page introuvable</span>
  </div>
);

export default Custom404;
