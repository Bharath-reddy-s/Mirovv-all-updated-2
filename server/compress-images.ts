import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq } from "drizzle-orm";
import { productsTable } from "@shared/schema";
import sharp from "sharp";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const dbUrl = process.env.DATABASE_URL!.trim().replace(/^['"]|['"]$/g, '');
const pool = new Pool({ connectionString: dbUrl });
const db = drizzle({ client: pool });

function isBase64Image(str: string): boolean {
  return str.startsWith('data:image/');
}

function getImageFormat(base64: string): string {
  const match = base64.match(/data:image\/(\w+);base64,/);
  return match ? match[1] : 'unknown';
}

async function compressBase64Image(base64: string): Promise<string> {
  if (!isBase64Image(base64)) {
    return base64;
  }

  const format = getImageFormat(base64);
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  
  const originalSize = buffer.length;
  
  try {
    const compressed = await sharp(buffer)
      .webp({ 
        quality: 85,
        effort: 6,
        nearLossless: true
      })
      .toBuffer();
    
    const newSize = compressed.length;
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
    
    console.log(`  Compressed: ${format} ${(originalSize / 1024).toFixed(1)}KB -> WebP ${(newSize / 1024).toFixed(1)}KB (${savings}% savings)`);
    
    return `data:image/webp;base64,${compressed.toString('base64')}`;
  } catch (error) {
    console.log(`  Failed to compress (keeping original): ${error}`);
    return base64;
  }
}

async function compressProductImages() {
  console.log("Fetching all products...\n");
  
  const products = await db.select().from(productsTable);
  console.log(`Found ${products.length} products to process\n`);
  
  let totalOriginalSize = 0;
  let totalNewSize = 0;
  
  for (const product of products) {
    console.log(`Processing: ${product.title} (ID: ${product.id})`);
    
    let updated = false;
    let newImage = product.image;
    let newAdditionalImages = product.additionalImages;
    
    if (product.image && isBase64Image(product.image)) {
      const originalSize = Buffer.from(product.image.replace(/^data:image\/\w+;base64,/, ''), 'base64').length;
      totalOriginalSize += originalSize;
      
      newImage = await compressBase64Image(product.image);
      
      const newSize = Buffer.from(newImage.replace(/^data:image\/\w+;base64,/, ''), 'base64').length;
      totalNewSize += newSize;
      
      if (newImage !== product.image) {
        updated = true;
      }
    }
    
    if (product.additionalImages && product.additionalImages.length > 0) {
      const compressedAdditional: string[] = [];
      
      for (let i = 0; i < product.additionalImages.length; i++) {
        const img = product.additionalImages[i];
        if (isBase64Image(img)) {
          const originalSize = Buffer.from(img.replace(/^data:image\/\w+;base64,/, ''), 'base64').length;
          totalOriginalSize += originalSize;
          
          console.log(`  Additional image ${i + 1}/${product.additionalImages.length}:`);
          const compressed = await compressBase64Image(img);
          compressedAdditional.push(compressed);
          
          const newSize = Buffer.from(compressed.replace(/^data:image\/\w+;base64,/, ''), 'base64').length;
          totalNewSize += newSize;
          
          if (compressed !== img) {
            updated = true;
          }
        } else {
          compressedAdditional.push(img);
        }
      }
      
      newAdditionalImages = compressedAdditional;
    }
    
    if (updated) {
      await db.update(productsTable)
        .set({ 
          image: newImage,
          additionalImages: newAdditionalImages
        })
        .where(eq(productsTable.id, product.id));
      console.log(`  Updated in database\n`);
    } else {
      console.log(`  No changes needed\n`);
    }
  }
  
  const totalSavings = ((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(1);
  console.log("\n=== COMPRESSION COMPLETE ===");
  console.log(`Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total new size: ${(totalNewSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total savings: ${totalSavings}%`);
  
  await pool.end();
  process.exit(0);
}

compressProductImages().catch((error) => {
  console.error("Compression failed:", error);
  process.exit(1);
});
