export const ITEM_TYPES = {
  postcard: "Carte postale",
  stationery: "Papeterie",
  game: "Jeu",
  book: "Livre",
  unknown: "Inconnu",
  dvd: "DVD",
  deposit: "consigne",
} as const;

export type ItemType = keyof typeof ITEM_TYPES;
export const ItemTypes = [
  "postcard",
  "stationery",
  "game",
  "book",
  "unknown",
  "dvd",
  "deposit",
] as const;

export const TVAValues = ["20", "5.5", "2.1", "0"] as const;
export type TVA = (typeof TVAValues)[number];

export type BaseItem = {
  type: ItemType;
  isbn: string;
  author: string;
  title: string;
  publisher: string;
  distributor: string;
  keywords: string;
  datebought: string;
  comments: string;
  price: string;
  amount: number;
  tva: TVA;
};

export type DBItem = BaseItem & {
  starred: boolean;
  nmAuthor: string;
  nmTitle: string;
  nmPublisher: string;
  nmDistributor: string;
};

export type Item = DBItem & { _id: string };

export type ItemWithCount = Item & { count: number };
