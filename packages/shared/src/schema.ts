import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  char,
  check,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { ItemTypes, TVAValues } from "./item";
import { CONTACT_MEAN, ORDER_STATUS } from "./order";

export const roleEnum = pgEnum("role", ["admin", "cashier"]);

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 256 }).notNull(),
  hash: char("hash", { length: 60 }).notNull(),
  role: roleEnum("role").notNull(),
});

export type User = typeof users.$inferSelect;

export const itemTypeEnum = pgEnum("itemType", ItemTypes);

export const tvaEnum = pgEnum("tva", TVAValues);

export const items = pgTable(
  "items",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    type: itemTypeEnum("type").notNull(),
    isbn: varchar("isbn", { length: 13 }).notNull(),
    author: varchar("author").notNull(),
    title: varchar("title").notNull(),
    publisher: varchar("publisher").notNull(),
    distributor: varchar("distributor").notNull(),
    keywords: varchar("keywords"),
    datebought: date("datebought").notNull(),
    comments: varchar("comments"),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    amount: integer("amount").notNull(),
    tva: tvaEnum("tva").notNull(),
    starred: boolean("starred").notNull(),
    nmAuthor: varchar("nmAuthor").notNull(),
    nmTitle: varchar("nmTitle").notNull(),
    nmPublisher: varchar("nmPublisher").notNull(),
    nmDistributor: varchar("nmDistributor").notNull(),
  },
  (table) => [
    index("items_nmAuthor_idx").on(table.nmAuthor),
    index("items_nmTitle_idx").on(table.nmTitle),
    index("items_nmPublisher_idx").on(table.nmPublisher),
    index("items_nmDistributor_idx").on(table.nmDistributor),
    uniqueIndex("items_isbn_unique")
      .on(table.isbn)
      .where(sql`${table.isbn} != ''`),
    check("items_amount_nonnegative", sql`${table.amount} >= 0`),
  ],
);
export type Item = typeof items.$inferSelect;

const cartItemColumns = () => ({
  itemId: integer("itemId").references(() => items.id),
  type: itemTypeEnum("type").notNull(),
  title: varchar("title").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  tva: tvaEnum("tva").notNull(),
  quantity: integer("quantity").notNull(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id),
});

const cartIndexes = (
  table: { itemId: AnyPgColumn; userId: AnyPgColumn },
  prefix: string,
) => [
  index(`${prefix}_userId_idx`).on(table.userId),
  uniqueIndex(`${prefix}_item_user_unique`)
    .on(table.itemId, table.userId)
    .where(sql`${table.itemId} IS NOT NULL`),
];

export const cart = pgTable(
  "cart",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    ...cartItemColumns(),
  },
  (table) => [
    ...cartIndexes(table, "cart"),
    check("cart_quantity_positive", sql`${table.quantity} > 0`),
  ],
);

export const asideCart = pgTable(
  "asideCart",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    ...cartItemColumns(),
  },
  (table) => [
    ...cartIndexes(table, "asideCart"),
    check("asideCart_quantity_positive", sql`${table.quantity} > 0`),
  ],
);

export const paymentTypeEnum = pgEnum("paymentType", [
  "cash",
  "card",
  "check",
  "check-lire",
  "transfer",
]);

export const sales = pgTable(
  "sales",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    itemType: itemTypeEnum("itemType").notNull(),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull(),
    title: varchar("title"),
    created: timestamp("created", { withTimezone: true })
      .notNull()
      .defaultNow(),
    tva: tvaEnum("tva").notNull(),
    linkedToCustomer: boolean("linkedToCustomer").notNull(),
    itemId: integer("itemId").references(() => items.id),
    cartId: integer("cartId").notNull(), // No reference because cart rows will be deleted
    deleted: boolean("deleted").notNull(),
    paymentType: paymentTypeEnum("paymentType").notNull(),
  },
  (table) => [
    index("sales_itemId_idx").on(table.itemId),
    index("sales_deleted_idx").on(table.deleted),
    index("sales_created_idx").on(table.created),
    check("sales_quantity_positive", sql`${table.quantity} > 0`),
  ],
);

export const customers = pgTable(
  "customers",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    fullname: varchar("fullname").notNull(),
    nmFullname: varchar("nmFullname").notNull(),
    contact: varchar("contact").notNull(),
    phone: varchar("phone"),
    email: varchar("email"),
    comment: varchar("comment").notNull(),
  },
  (table) => [
    uniqueIndex("customers_nmFullname_unique").on(
      sql`lower(${table.nmFullname})`,
    ),
  ],
);

export const purchases = pgTable(
  "purchases",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    date: varchar("date").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    customerId: integer("customerId")
      .notNull()
      .references(() => customers.id),
  },
  (table) => [index("purchases_customerId_idx").on(table.customerId)],
);

export const selectedCustomer = pgTable("selectedCustomer", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  asideCart: boolean("asideCart").notNull(),
  userId: integer("userId")
    .notNull()
    .unique()
    .references(() => users.id),
  customerId: integer("customerId").references(() => customers.id),
});

export const orderStatusEnum = pgEnum("orderStatus", ORDER_STATUS);

export const contactMeanEnum = pgEnum("contactMean", CONTACT_MEAN);

export const orders = pgTable(
  "orders",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    created: timestamp("created", { withTimezone: true })
      .notNull()
      .defaultNow(),
    customerId: integer("customerId")
      .notNull()
      .references(() => customers.id),
    itemId: integer("itemId").references(() => items.id),
    itemTitle: varchar("itemTitle").notNull(),
    ordered: orderStatusEnum("ordered").notNull(),
    customerNotified: boolean("customerNotified").notNull(),
    paid: boolean("paid").notNull(),
    comment: varchar("comment").notNull(),
    nb: integer("nb").notNull(),
    contact: contactMeanEnum("contact").notNull().default("unknown"),
  },
  (table) => [
    index("orders_customerId_idx").on(table.customerId),
    index("orders_ordered_idx").on(table.ordered),
    check("orders_nb_positive", sql`${table.nb} > 0`),
  ],
);
