/* Usage: pnpm --filter @livrelibre/server seed */
import type { BaseItem } from "@livrelibre/shared/item";
import { customers, items, sales, users } from "@livrelibre/shared/schema";
import { norm } from "@livrelibre/shared/utils";
import { db } from "@server/db/database";
import bcrypt from "bcrypt";
import { eq, inArray } from "drizzle-orm";

const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "admin";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "admin";

const demoItems = [
  {
    type: "book",
    isbn: "9782070413119",
    author: "Antoine de Saint-Exupéry",
    title: "Le Petit Prince",
    publisher: "Gallimard",
    distributor: "Gallimard",
    keywords: null,
    datebought: "2024-01-15",
    comments: null,
    price: "8.90",
    amount: 5,
    tva: "5.5",
  },
  {
    type: "book",
    isbn: "9782253006329",
    author: "Albert Camus",
    title: "L'Étranger",
    publisher: "Le Livre de Poche",
    distributor: "Hachette",
    keywords: null,
    datebought: "2024-02-03",
    comments: null,
    price: "6.60",
    amount: 8,
    tva: "5.5",
  },
  {
    type: "book",
    isbn: "9782070360024",
    author: "George Orwell",
    title: "1984",
    publisher: "Gallimard",
    distributor: "Gallimard",
    keywords: null,
    datebought: "2024-02-20",
    comments: null,
    price: "9.40",
    amount: 3,
    tva: "5.5",
  },
  {
    type: "magazine",
    isbn: "9782266132640",
    author: "Collectif",
    title: "Revue de démo",
    publisher: "Démo Presse",
    distributor: "Démo Diffusion",
    keywords: null,
    datebought: "2024-03-05",
    comments: null,
    price: "12.00",
    amount: 10,
    tva: "20",
  },
] satisfies BaseItem[];

const demoCustomers = [
  {
    fullname: "Marie Dupont",
    contact: "06 12 34 56 78",
    phone: "0612345678",
    email: "marie.dupont@example.com",
    comment: "Cliente fidèle",
  },
  {
    fullname: "Jean Martin",
    contact: "jean.martin@example.com",
    phone: null,
    email: "jean.martin@example.com",
    comment: "",
  },
];

const saleSeeds = [
  { isbn: "9782070413119", quantity: 2, receiptId: 1, paymentType: "cash", daysAgo: 0 },
  { isbn: "9782253006329", quantity: 1, receiptId: 1, paymentType: "cash", daysAgo: 0 },
  { isbn: "9782070360024", quantity: 1, receiptId: 2, paymentType: "card", daysAgo: 3 },
] as const;

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const main = async () => {
  try {
    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.name, ADMIN_NAME),
    });
    if (existingAdmin) {
      console.log(`L'utilisateur ${ADMIN_NAME} existe déjà`);
    } else {
      const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await db.insert(users).values({ name: ADMIN_NAME, hash, role: "admin" });
      console.log(`L'utilisateur ${ADMIN_NAME} a été créé`);
    }

    await db
      .insert(items)
      .values(
        demoItems.map((item) => ({
          ...item,
          starred: false,
          nmAuthor: norm(item.author),
          nmTitle: norm(item.title),
          nmPublisher: norm(item.publisher),
          nmDistributor: norm(item.distributor),
        })),
      )
      .onConflictDoNothing();
    console.log(`${demoItems.length} articles de démo insérés (ou déjà présents)`);

    await db
      .insert(customers)
      .values(
        demoCustomers.map((customer) => ({
          ...customer,
          nmFullname: norm(customer.fullname),
        })),
      )
      .onConflictDoNothing();
    console.log(`${demoCustomers.length} clients de démo insérés (ou déjà présents)`);

    const existingSales = await db.select().from(sales).limit(1);
    if (existingSales.length > 0) {
      console.log("Des ventes existent déjà, seed des ventes ignoré");
    } else {
      const dbItems = await db
        .select()
        .from(items)
        .where(
          inArray(
            items.isbn,
            demoItems.map((item) => item.isbn),
          ),
        );
      const itemByIsbn = new Map(dbItems.map((item) => [item.isbn, item]));
      const saleRows = saleSeeds.flatMap((seed) => {
        const item = itemByIsbn.get(seed.isbn);
        if (!item) return [];
        return [
          {
            itemType: item.type,
            price: item.price,
            quantity: seed.quantity,
            title: item.title,
            created: daysAgo(seed.daysAgo),
            tva: item.tva,
            linkedToCustomer: false,
            itemId: item.id,
            receiptId: seed.receiptId,
            deleted: false,
            paymentType: seed.paymentType,
          },
        ];
      });
      if (saleRows.length > 0) {
        await db.insert(sales).values(saleRows);
      }
      console.log(`${saleRows.length} ventes de démo insérées`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Seed échoué :", error);
    process.exit(1);
  }
};

void main();
