CREATE TABLE "itemTypes" (
	"code" varchar(64) PRIMARY KEY NOT NULL,
	"label" varchar NOT NULL,
	"position" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
INSERT INTO "itemTypes" ("code", "label", "position", "active", "isDefault") VALUES
	('postcard', 'Carte postale', 0, true, false),
	('stationery', 'Papeterie', 1, true, false),
	('game', 'Jeu', 2, true, false),
	('book', 'Livre', 3, true, true),
	('magazine', 'Revue', 4, true, false),
	('unknown', 'Inconnu', 5, true, false),
	('dvd', 'DVD', 6, true, false),
	('deposit', 'consigne', 7, true, false);
--> statement-breakpoint
ALTER TABLE "asideCart" ALTER COLUMN "type" SET DATA TYPE varchar(64) USING "type"::text;--> statement-breakpoint
ALTER TABLE "cart" ALTER COLUMN "type" SET DATA TYPE varchar(64) USING "type"::text;--> statement-breakpoint
ALTER TABLE "items" ALTER COLUMN "type" SET DATA TYPE varchar(64) USING "type"::text;--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "itemType" SET DATA TYPE varchar(64) USING "itemType"::text;--> statement-breakpoint
CREATE INDEX "itemTypes_position_idx" ON "itemTypes" USING btree ("position");--> statement-breakpoint
ALTER TABLE "asideCart" ADD CONSTRAINT "asideCart_type_itemTypes_code_fk" FOREIGN KEY ("type") REFERENCES "public"."itemTypes"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_type_itemTypes_code_fk" FOREIGN KEY ("type") REFERENCES "public"."itemTypes"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_type_itemTypes_code_fk" FOREIGN KEY ("type") REFERENCES "public"."itemTypes"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_itemType_itemTypes_code_fk" FOREIGN KEY ("itemType") REFERENCES "public"."itemTypes"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."itemType";
