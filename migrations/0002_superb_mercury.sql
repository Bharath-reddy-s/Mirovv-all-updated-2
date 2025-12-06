CREATE TABLE "flash_offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"max_claims" integer DEFAULT 5 NOT NULL,
	"claimed_count" integer DEFAULT 0 NOT NULL,
	"duration_seconds" integer DEFAULT 30 NOT NULL,
	"started_at" timestamp,
	"ends_at" timestamp,
	"banner_text" text DEFAULT 'First 5 orders are FREE!' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "order_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "is_flash_offer" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "promotional_settings" ADD COLUMN "timer_end_time" timestamp;--> statement-breakpoint
ALTER TABLE "promotional_settings" ADD COLUMN "delivery_text" text DEFAULT 'Shop for ₹199 and get free delivery' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_order_number_unique" UNIQUE("order_number");