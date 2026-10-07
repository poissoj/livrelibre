CREATE SEQUENCE "public"."sales_receipt_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
ALTER TABLE "sales" RENAME COLUMN "cartId" TO "receiptId";--> statement-breakpoint
CREATE INDEX "sales_receiptId_idx" ON "sales" USING btree ("receiptId");--> statement-breakpoint
SELECT setval('"public"."sales_receipt_id_seq"', (SELECT GREATEST(MAX("receiptId"), 1) FROM "sales"));