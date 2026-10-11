ALTER TABLE "orders" ADD COLUMN "nmTitle" varchar;--> statement-breakpoint
UPDATE "orders" SET "nmTitle" = lower(translate("itemTitle", 'àâäáãåāçéèêëēíìîïīóòôöõúùûüýÿñ', 'aaaaaaaaceeeeeiiiiooooouuuuyyn'));--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "nmTitle" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "orders_ordered_created_idx" ON "orders" USING btree ("ordered","created");--> statement-breakpoint
CREATE INDEX "orders_nmTitle_idx" ON "orders" USING btree ("nmTitle");
