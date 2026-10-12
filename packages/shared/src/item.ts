import { z } from "zod";

import { ERROR_CODES } from "./errors";
import { zAmount, zDateISO, zIsbn, zPrice } from "./validation";

/**
 * Libellés par défaut des types d'article. Ils servent à amorcer la table
 * `itemTypes` et restent la source des libellés tant que la page de gestion des
 * types (phase 2) n'est pas branchée sur la base.
 */
export const ITEM_TYPES: Record<string, string> = {
  postcard: "Carte postale",
  stationery: "Papeterie",
  game: "Jeu",
  book: "Livre",
  magazine: "Revue",
  unknown: "Inconnu",
  dvd: "DVD",
  deposit: "consigne",
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

export const TVAValues = ["20", "5.5", "2.1", "0"] as const;
export type TVA = (typeof TVAValues)[number];

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
