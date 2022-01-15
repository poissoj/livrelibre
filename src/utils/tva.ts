export const formatTVA = (tva: string | undefined) =>
  !tva || tva === "Inconnu" ? tva : `${Number(tva).toFixed(1)}%`;
