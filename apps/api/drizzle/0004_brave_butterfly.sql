ALTER TABLE "user" ALTER COLUMN "mobileNumber" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "brand" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "provider" text NOT NULL;