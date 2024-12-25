CREATE TABLE IF NOT EXISTS "homepage_contents" (
	"homepage_contents_id" serial PRIMARY KEY NOT NULL,
	"popular_categories" jsonb NOT NULL,
	"recent_deals" jsonb NOT NULL,
	"popular_products" jsonb NOT NULL,
	"slides" jsonb NOT NULL,
	"popular_with_men" jsonb NOT NULL,
	"popular_with_women" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product" (
	"productId" serial PRIMARY KEY NOT NULL,
	"productName" text NOT NULL,
	"price" text NOT NULL,
	"productDescription" jsonb NOT NULL,
	"image_urls" jsonb NOT NULL,
	"wishListId" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"avatarUrl" text,
	"email" text NOT NULL,
	"mobileNumber" integer,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wishlist" (
	"wishlistId" serial PRIMARY KEY NOT NULL,
	"userId" serial NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product" ADD CONSTRAINT "product_wishListId_wishlist_wishlistId_fk" FOREIGN KEY ("wishListId") REFERENCES "public"."wishlist"("wishlistId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
