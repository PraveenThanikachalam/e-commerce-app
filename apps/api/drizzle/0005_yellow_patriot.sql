ALTER TABLE "user" DROP CONSTRAINT "user_id_unique";--> statement-breakpoint
ALTER TABLE "wishlist" DROP CONSTRAINT "wishlist_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user" ADD PRIMARY KEY ("userId");--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "userId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_userId_user_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("userId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "id";