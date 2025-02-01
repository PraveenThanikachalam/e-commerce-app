CREATE TABLE "homepage_contents" (
	"homepage_contents_id" serial PRIMARY KEY NOT NULL,
	"popular_categories" jsonb NOT NULL,
	"recent_deals" jsonb NOT NULL,
	"popular_products" jsonb NOT NULL,
	"slides" jsonb NOT NULL,
	"popular_with_men" jsonb NOT NULL,
	"popular_with_women" jsonb NOT NULL
);
