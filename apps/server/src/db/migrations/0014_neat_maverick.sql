ALTER TABLE "itemTypes" ADD COLUMN "tva" "tva";--> statement-breakpoint
UPDATE "itemTypes" SET "tva" = (
	CASE "code"
		WHEN 'book' THEN '5.5'
		WHEN 'magazine' THEN '5.5'
		WHEN 'discount' THEN '5.5'
		ELSE '20'
	END
)::"tva";--> statement-breakpoint
ALTER TABLE "itemTypes" ALTER COLUMN "tva" SET NOT NULL;
