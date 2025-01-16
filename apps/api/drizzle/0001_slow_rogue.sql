ALTER TABLE "user" ADD COLUMN "userId" integer;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_id_unique" UNIQUE("id");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_userId_unique" UNIQUE("userId");