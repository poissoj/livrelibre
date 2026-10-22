-- Refuse la migration s'il existe déjà plusieurs utilisateurs avec le même nom.
-- Les comptes ne sont jamais fusionnés automatiquement : ils doivent être
-- renommés ou supprimés explicitement avant de relancer la migration.
DO $$
DECLARE
	duplicates text;
BEGIN
	SELECT string_agg(name, ', ')
		INTO duplicates
	FROM (
		SELECT name
		FROM "users"
		GROUP BY name
		HAVING count(*) > 1
		ORDER BY name
	) d;

	IF duplicates IS NOT NULL THEN
		RAISE EXCEPTION 'Migration 0019: noms d''utilisateurs en double: %. Renommez ou supprimez les doublons avant de relancer.', duplicates;
	END IF;
END $$;--> statement-breakpoint
-- Un défaut inactif est invalide : on le retire avant d'ajouter la contrainte.
UPDATE "itemTypes" SET "isDefault" = false WHERE "isDefault" AND NOT "active";--> statement-breakpoint
UPDATE "paymentMethods" SET "isDefault" = false WHERE "isDefault" AND NOT "active";--> statement-breakpoint
-- En cas de défauts multiples, on garde le premier par position puis par code.
WITH ranked AS (
	SELECT "code", row_number() OVER (ORDER BY "position", "code") AS rn
	FROM "itemTypes"
	WHERE "isDefault"
)
UPDATE "itemTypes"
SET "isDefault" = false
FROM ranked
WHERE "itemTypes"."code" = ranked."code"
	AND ranked.rn > 1;--> statement-breakpoint
WITH ranked AS (
	SELECT "code", row_number() OVER (ORDER BY "position", "code") AS rn
	FROM "paymentMethods"
	WHERE "isDefault"
)
UPDATE "paymentMethods"
SET "isDefault" = false
FROM ranked
WHERE "paymentMethods"."code" = ranked."code"
	AND ranked.rn > 1;--> statement-breakpoint
CREATE UNIQUE INDEX "itemTypes_isDefault_unique" ON "itemTypes" USING btree ("isDefault") WHERE "itemTypes"."isDefault";--> statement-breakpoint
CREATE UNIQUE INDEX "paymentMethods_isDefault_unique" ON "paymentMethods" USING btree ("isDefault") WHERE "paymentMethods"."isDefault";--> statement-breakpoint
CREATE UNIQUE INDEX "users_name_unique" ON "users" USING btree ("name");--> statement-breakpoint
ALTER TABLE "itemTypes" ADD CONSTRAINT "itemTypes_default_active" CHECK (NOT "itemTypes"."isDefault" OR "itemTypes"."active");--> statement-breakpoint
ALTER TABLE "paymentMethods" ADD CONSTRAINT "paymentMethods_default_active" CHECK (NOT "paymentMethods"."isDefault" OR "paymentMethods"."active");
