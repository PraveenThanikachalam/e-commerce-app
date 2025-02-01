ALTER TABLE "wishlist" ALTER COLUMN "userId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "wishlist" ALTER COLUMN "userId" DROP NOT NULL;