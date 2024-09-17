import {
  boolean,
  char,
  integer,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { ItemTypes, TVAValues } from "@/utils/item";
import { CONTACT_MEAN, ORDER_STATUS } from "@/utils/order";

export const roleEnum = pgEnum("role", ["admin", "guest"]);

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 256 }).notNull(),
  hash: char("hash", { length: 60 }).notNull(),
  role: roleEnum("role").notNull(),
});

export type User = typeof users.$inferSelect;

export const itemTypeEnum = pgEnum("itemType", ItemTypes);

export const tvaEnum = pgEnum("tva", TVAValues);

export const items = pgTable("items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  type: itemTypeEnum("type").notNull(),
  isbn: varchar("isbn", { length: 13 }).notNull(),
  author: varchar("author").notNull(),
  title: varchar("title").notNull(),
  publisher: varchar("publisher").notNull(),
  distributor: varchar("distributor").notNull(),
  keywords: varchar("keywords"),
  datebought: char("datebought", { length: 10 }).notNull(),
  comments: varchar("comments"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  amount: integer("amount").notNull(),
  tva: tvaEnum("tva").notNull(),
  starred: boolean("starred").notNull(),
  nmAuthor: varchar("nmAuthor").notNull(),
  nmTitle: varchar("nmTitle").notNull(),
  nmPublisher: varchar("nmPublisher").notNull(),
  nmDistributor: varchar("nmDistributor").notNull(),
});
export type Item = typeof items.$inferSelect;

export const cart = pgTable("cart", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
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

export const asideCart = pgTable("asideCart", {
  id: integer("id").primaryKey(),
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

export const paymentTypeEnum = pgEnum("paymentType", [
  "cash",
  "card",
  "check",
  "check-lire",
  "transfer",
]);

export const sales = pgTable("sales", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  itemType: itemTypeEnum("itemType").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  title: varchar("title"),
  created: timestamp("created", { withTimezone: true }).notNull().defaultNow(),
  tva: tvaEnum("tva"),
  linkedToCustomer: boolean("linkedToCustomer").notNull(),
  itemId: integer("itemId").references(() => items.id),
  cartId: integer("cartId"), // No reference because cart rows will be deleted
  deleted: boolean("deleted").notNull(),
  paymentType: paymentTypeEnum("paymentType"),
});

export const customers = pgTable("customers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  fullname: varchar("fullname").notNull(),
  nmFullname: varchar("nmFullname").notNull(),
  contact: varchar("contact").notNull(),
  phone: varchar("phone"),
  email: varchar("email"),
  comment: varchar("comment").notNull(),
});

export const purchases = pgTable("purchases", {
  date: varchar("date").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  customerId: integer("customerId")
    .notNull()
    .references(() => customers.id),
});

export const selectedCustomer = pgTable("selectedCustomer", {
  asideCart: boolean("asideCart").notNull(),
  userId: integer("userId")
    .notNull()
    .unique()
    .references(() => users.id),
  customerId: integer("customerId").references(() => customers.id),
});

export const orderStatusEnum = pgEnum("orderStatus", ORDER_STATUS);

export const contactMeanEnum = pgEnum("contactMean", CONTACT_MEAN);

export const orders = pgTable("orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  created: timestamp("created", { withTimezone: true }).notNull().defaultNow(),
  customerId: integer("customerId")
    // .notNull()
    .references(() => customers.id),
  itemId: integer("itemId").references(() => items.id),
  itemTitle: varchar("itemTitle").notNull(),
  ordered: orderStatusEnum("ordered").notNull(),
  customerNotified: boolean("customerNotified").notNull(),
  paid: boolean("paid").notNull(),
  comment: varchar("comment").notNull(),
  nb: integer("nb").notNull(),
  contact: contactMeanEnum("contact").notNull().default("unknown"),
});
