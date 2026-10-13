import { z } from "zod";

import { ERROR_CODES } from "./errors";
import { zAmount, zDateISO, zIsbn, zPrice } from "./validation";

export const TVAValues = ["20", "5.5", "2.1", "0"] as const;
export type TVA = (typeof TVAValues)[number];

/**
 * Types d'article par défaut (code → libellé + TVA associée). Ils servent à
 * amorcer la table `itemTypes`.
 */
export const ITEM_TYPES: Record<string, { label: string; tva: TVA }> = {
  postcard: { label: "Carte postale", tva: "20" },
  stationery: { label: "Papeterie", tva: "20" },
  game: { label: "Jeu", tva: "20" },
  book: { label: "Livre", tva: "5.5" },
  magazine: { label: "Revue", tva: "5.5" },
  unknown: { label: "Inconnu", tva: "20" },
  dvd: { label: "DVD", tva: "20" },
  deposit: { label: "consigne", tva: "20" },
};

/** Type utilisé pour l'import DILICOM (articles créés / incrémentés). */
export const BOOK_ITEM_TYPE = "book";

/**
 * Type dédié aux lignes de remise (fidélité). Masqué des listes (`active=false`)
 * mais conservé comme type à part entière pour les statistiques et l'historique.
 */
export const DISCOUNT_ITEM_TYPE = "discount";
export const DISCOUNT_ITEM_TYPE_LABEL = "Remise";

/** Code d'un type d'article : identifiant stable stocké en base. */
export type ItemType = string;

export const zItemType = z.string().trim().min(1, ERROR_CODES.INVALID_ITEM_TYPE);

export const zItem = z.object({
  type: zItemType,
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
