import type { ReactElement } from "react";

const Custom500 = (): ReactElement => (
  <div className="flex-1 self-center text-center text-2xl">
    <h1 className="font-bold">Erreur 500</h1>
    <span>Erreur interne</span>
  </div>
);

export default Custom500;
