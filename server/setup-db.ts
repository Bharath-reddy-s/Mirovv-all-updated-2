import { drizzle } from "drizzle-orm/neon-serverless";
import { products as initialProducts, productsTable } from "@shared/schema";
import ws from "ws";

async function setupDatabase() {
  try {
    console.log("Checking DATABASE_URL...");
    
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }

    console.log("Connecting to database...");
    const sql = drizzle({
      connection: process.env.DATABASE_URL,
      ws: ws,
    });

    console.log("Checking if products table exists and has data...");
    const existingProducts = await sql.select().from(productsTable);
    
    console.log(`Found ${existingProducts.length} existing products`);

    if (existingProducts.length === 0) {
      console.log("Seeding database with initial products...");
      await sql.insert(productsTable).values(initialProducts);
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
