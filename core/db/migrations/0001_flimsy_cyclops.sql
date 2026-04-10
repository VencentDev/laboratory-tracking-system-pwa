ALTER TABLE "tools" ALTER COLUMN "current_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tools" ALTER COLUMN "current_status" SET DEFAULT 'available'::text;--> statement-breakpoint
UPDATE "tools" SET "current_status" = 'missing' WHERE "current_status" = 'unreturned';--> statement-breakpoint
DROP TYPE "public"."tool_status";--> statement-breakpoint
CREATE TYPE "public"."tool_status" AS ENUM('available', 'borrowed', 'missing');--> statement-breakpoint
ALTER TABLE "tools" ALTER COLUMN "current_status" SET DEFAULT 'available'::"public"."tool_status";--> statement-breakpoint
ALTER TABLE "tools" ALTER COLUMN "current_status" SET DATA TYPE "public"."tool_status" USING "current_status"::"public"."tool_status";
