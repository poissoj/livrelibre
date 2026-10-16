DROP INDEX "sales_created_idx";--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "soldAt" timestamp with time zone;--> statement-breakpoint
UPDATE "sales" SET "soldAt" = "created";--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "soldAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "soldAt" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "sales_soldAt_idx" ON "sales" USING btree ("soldAt");
