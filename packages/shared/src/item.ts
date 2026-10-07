import { z } from "zod";

import { zAmount, zDateISO, zIsbn, zPrice } from "./validation";

export const ITEM_TYPES = {
  postcard: "Carte postale",
  stationery: "Papeterie",
  game: "Jeu",
  book: "Livre",
  magazine: "Revue",
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
  "magazine",
  "unknown",
  "dvd",
  "deposit",
] as const;

export const TVAValues = ["20", "5.5", "2.1", "0"] as const;
export type TVA = (typeof TVAValues)[number];

export const zItem = z.object({
  type: z.enum(ItemTypes),
  isbn: zIsbn,
  author: z.string(),
  title: z.string(),
  publisher: z.string(),
  distributor: z.string(),
  keywords: z.string().nullable(),
  datebought: zDateISO,
  comments: z.string().nullable(),
  price: zPrice,
  amount: zAmount,
  tva: z.enum(TVAValues),
});

export type ItemInput = z.infer<typeof zItem>;

export type BaseItem = {
  type: ItemType;
  isbn: string;
  author: string;
  title: string;
  publisher: string;
  distributor: string;
  keywords: string | null;
  datebought: string;
  comments: string | null;
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

export type Item = DBItem & { id: number };

export type ItemWithCount = Item & { count: number };
