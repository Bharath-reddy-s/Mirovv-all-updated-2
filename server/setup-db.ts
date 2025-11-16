import { drizzle } from "drizzle-orm/neon-serverless";
import { products as initialProducts, productsTable } from "@shared/schema";
import { sql as sqlOp } from "drizzle-orm";
import ws from "ws";

async function setupDatabase() {
  try {
    console.log("Checking DATABASE_URL...");
    
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }

    console.log("Connecting to database...");
    const db = drizzle({
      connection: process.env.DATABASE_URL,
      ws: ws,
    });

    console.log("Creating products table if it doesn't exist...");
    await db.execute(sqlOp`
      CREATE TABLE IF NOT EXISTS "products" (
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
    `);

    console.log("Checking if products table has data...");
    const existingProducts = await db.select().from(productsTable);
    
    console.log(`Found ${existingProducts.length} existing products`);

    if (existingProducts.length === 0) {
      console.log("Seeding database with initial products...");
      await db.insert(productsTable).values(initialProducts);
      console.log("Database seeded successfully!");
    } else {
      console.log("Database already has products, skipping seed.");
    }

    console.log("Database setup complete!");
    process.exit(0);
  } catch (error) {
    console.error("Database setup failed:");
    console.error(error);
    process.exit(1);
  }
}

setupDatabase();
