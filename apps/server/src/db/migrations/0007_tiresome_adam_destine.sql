UPDATE "items" SET "amount" = 0 WHERE "amount" < 0;--> statement-breakpoint
UPDATE "orders" SET "nb" = 1 WHERE "nb" <= 0;--> statement-breakpoint
DELETE FROM "sales" WHERE "quantity" <= 0;--> statement-breakpoint
DELETE FROM "cart" WHERE "quantity" <= 0;--> statement-breakpoint
DELETE FROM "asideCart" WHERE "quantity" <= 0;--> statement-breakpoint
ALTER TABLE "asideCart" ADD CONSTRAINT "asideCart_quantity_positive" CHECK ("asideCart"."quantity" > 0);--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_quantity_positive" CHECK ("cart"."quantity" > 0);--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_amount_nonnegative" CHECK ("items"."amount" >= 0);--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_nb_positive" CHECK ("orders"."nb" > 0);--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_quantity_positive" CHECK ("sales"."quantity" > 0);