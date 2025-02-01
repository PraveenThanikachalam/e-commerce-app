CREATE TABLE "wishlist_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"wishlistId" integer NOT NULL,
	"productId" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "homepage_contents" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "homepage_contents" CASCADE;--> statement-breakpoint
ALTER TABLE "product" DROP CONSTRAINT "product_wishListId_wishlist_wishlistId_fk";
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "userId" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "wishlist" ALTER COLUMN "userId" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "wishlist" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_wishlistId_wishlist_wishlistId_fk" FOREIGN KEY ("wishlistId") REFERENCES "public"."wishlist"("wishlistId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_productId_product_productId_fk" FOREIGN KEY ("productId") REFERENCES "public"."product"("productId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "wishListId";