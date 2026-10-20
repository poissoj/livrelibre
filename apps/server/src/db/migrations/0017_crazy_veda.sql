CREATE TABLE "paymentMethods" (
	"code" varchar(64) PRIMARY KEY NOT NULL,
	"label" varchar NOT NULL,
	"position" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
INSERT INTO "paymentMethods" ("code", "label", "position", "active", "isDefault") VALUES
	('cash', 'Espèces', 0, true, true),
	('card', 'Carte bleue', 1, true, false),
	('check', 'Chèque', 2, true, false),
	('check-lire', 'Chèque lire', 3, true, false),
	('transfer', 'Virement', 4, true, false);
--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "paymentType" SET DATA TYPE varchar(64) USING "paymentType"::text;--> statement-breakpoint
CREATE INDEX "paymentMethods_position_idx" ON "paymentMethods" USING btree ("position");--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_paymentType_paymentMethods_code_fk" FOREIGN KEY ("paymentType") REFERENCES "public"."paymentMethods"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."paymentType";