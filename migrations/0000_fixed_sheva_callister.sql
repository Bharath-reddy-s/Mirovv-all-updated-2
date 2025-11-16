CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"label" text NOT NULL,
	"price" text NOT NULL,
	"original_price" text,
	"pricing_text" text,
	"image" text NOT NULL,
	"additional_images" text[],
	"description" text NOT NULL,
	"long_description" text NOT NULL,
	"features" text[],
	"whats_in_the_box" text[] NOT NULL,
	"specifications" jsonb,
	"product_link" text,
	"is_in_stock" boolean DEFAULT true NOT NULL
);
