export const ITEM_TYPES: Record<string, string> = {
  postcard: "Carte postale",
  stationery: "Papeterie",
  game: "Jeu",
  book: "Livre",
  unknown: "Inconnu",
  dvd: "DVD",
  deposit: "consigne",
};

type TVA = "0" | "2.1" | "5.5" | "20";

export type Item = {
  _id: string;
  type: string;
  isbn: string;
  author: string;
  title: string;
  publisher: string;
  distributor: string;
  keywords: string;
  datebought: string;
  comments: string;
  prix_achat: string;
  price: string;
  amount: number;
  tva: TVA;
  ordered: boolean;
  starred: boolean;
};
