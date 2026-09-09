DO $$ BEGIN
 ALTER TYPE "contactMean" ADD VALUE 'unknown';
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TYPE "contactMean" ADD VALUE 'in person';
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TYPE "contactMean" ADD VALUE 'phone';
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN IF EXISTS "_id";--> statement-breakpoint
ALTER TABLE "items" DROP COLUMN IF EXISTS "_id";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN IF EXISTS "customerObjectId";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN IF EXISTS "itemObjectId";--> statement-breakpoint
ALTER TABLE "sales" DROP COLUMN IF EXISTS "itemObjectId";