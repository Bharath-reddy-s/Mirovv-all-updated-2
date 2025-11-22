CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_name" text NOT NULL,
	"mobile" text NOT NULL,
	"address" text NOT NULL,
	"instagram" text NOT NULL,
	"items" jsonb NOT NULL,
	"total" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_filters" (
	"id" serial PRIMARY KEY NOT NULL,
	"value" integer NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promotional_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"banner_text" text DEFAULT '₹10 off on every product' NOT NULL,
	"timer_days" integer DEFAULT 7 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"reviewer_name" text,
	"review_text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "display_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;