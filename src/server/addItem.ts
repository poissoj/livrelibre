import type { BaseItem, DBItem } from "@/utils/item";
import { norm } from "@/utils/utils";
import { getDb } from "./database";

export const addItem = async (
  item: BaseItem
): Promise<{ type: "success" | "warning" | "error"; msg: string }> => {
  const db = await getDb();
  const existingItem = await db
    .collection<DBItem>("books")
    .findOne({ isbn: item.isbn });
  if (existingItem && existingItem.isbn !== "") {
    return { type: "warning", msg: "Un article avec cet ISBN existe déjà." };
  }
  const newItem: Omit<DBItem, "starred"> = {
    ...item,
    amount: Number(item.amount),
    price: item.price.replace(",", "."),
    prix_achat: item.prix_achat.replace(",", "."),
    nmAuthor: norm(item.author),
    nmTitle: norm(item.title),
    nmPublisher: norm(item.publisher),
    nmDistributor: norm(item.distributor),
  };

  try {
    const res = await db.collection<typeof newItem>("books").insertOne(newItem);
    console.log(res);
  } catch (error) {
    console.error(error);
    return { type: "error", msg: "Impossible d'ajouter cet article." };
  }
  return { type: "success", msg: `"${item.title}" a été ajouté.` };
};
