ALTER TABLE "product" RENAME TO "products";--> statement-breakpoint
ALTER TABLE "wishlist" RENAME TO "wishlists";--> statement-breakpoint
ALTER TABLE "wishlist_items" DROP CONSTRAINT "wishlist_items_wishlistId_wishlist_wishlistId_fk";
--> statement-breakpoint
ALTER TABLE "wishlist_items" DROP CONSTRAINT "wishlist_items_productId_product_productId_fk";
--> statement-breakpoint
ALTER TABLE "wishlists" DROP CONSTRAINT "wishlist_userId_user_userId_fk";
--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_wishlistId_wishlists_wishlistId_fk" FOREIGN KEY ("wishlistId") REFERENCES "public"."wishlists"("wishlistId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_productId_products_productId_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("productId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_userId_user_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("userId") ON DELETE no action ON UPDATE no action;