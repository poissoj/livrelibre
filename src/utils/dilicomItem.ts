export type DilicomRow = {
  EAN: string;
  TITRE: string;
  AUTEUR: string;
  EDITEUR: string;
  DISTRIBUTEUR: string;
  PRIX: number;
  DISPO: string;
  "REF.LIGNE": string;
  QTE: number;
  TOTAL: number;
};

export type DilicomRowWithId = DilicomRow & {
  id: number | null;
  amount: number | null;
};
