import type { Item } from "@livrelibre/shared/item";

export type NewItem = { id: null; title: string };
export type ItemValue = Item | NewItem | null;
