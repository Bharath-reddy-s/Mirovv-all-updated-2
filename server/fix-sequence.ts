import { drizzle } from "drizzle-orm/neon-serverless";
import { sql } from "drizzle-orm";
import ws from "ws";

async function fixSequence() {
  try {
    const db = drizzle({
      connection: process.env.DATABASE_URL!,
      ws: ws,
    });

    console.log("Resetting product ID sequence...");
    
    await db.execute(sql`
      SELECT setval(pg_get_serial_sequence('products', 'id'), 
        COALESCE((SELECT MAX(id) FROM products), 0) + 1, 
        false
      );
    `);

    console.log("Sequence reset successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to fix sequence:", error);
    process.exit(1);
  }
}

fixSequence();
