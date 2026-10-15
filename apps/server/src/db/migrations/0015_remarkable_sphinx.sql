CREATE TABLE "settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"loyaltyDiscountPercent" numeric(5, 2) DEFAULT '3' NOT NULL
);
--> statement-breakpoint
INSERT INTO "settings" ("id", "loyaltyDiscountPercent")
VALUES (1, '3')
ON CONFLICT ("id") DO NOTHING;
