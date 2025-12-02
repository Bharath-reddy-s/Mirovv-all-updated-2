import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { productsTable } from "@shared/schema";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import ws from "ws";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    if (url.startsWith('data:image/')) {
      const base64Data = url.replace(/^data:image\/\w+;base64,/, '');
      return Buffer.from(base64Data, 'base64');
    }
    
    if (url.startsWith('/')) {
      console.log(`  Skipping local path: ${url}`);
      return null;
    }

    console.log(`  Downloading: ${url.substring(0, 80)}...`);
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`  Failed to download: ${response.status}`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.log(`  Download error: ${error}`);
    return null;
  }
}

async function compressImage(buffer: Buffer, maxWidth: number = 800): Promise<string> {
  try {
    const metadata = await sharp(buffer).metadata();
    const originalSize = buffer.length;
    
    const compressed = await sharp(buffer)
      .resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ 
        quality: 75,
        effort: 6
      })
      .toBuffer();
    
    const compressionRatio = ((originalSize - compressed.length) / originalSize * 100).toFixed(1);
    console.log(`  Compressed: ${(originalSize / 1024).toFixed(1)}KB -> ${(compressed.length / 1024).toFixed(1)}KB (${compressionRatio}% reduction)`);
    
    return `data:image/webp;base64,${compressed.toString('base64')}`;
  } catch (error) {
    console.error(`  Compression failed:`, error);
    throw error;
  }
}

async function compressAllProductImages() {
  console.log("Starting image compression for all products...\n");
  
  const products = await db.select().from(productsTable);
  console.log(`Found ${products.length} products to process\n`);
  
  let totalOriginalSize = 0;
  let totalCompressedSize = 0;
  let imagesProcessed = 0;
  let imagesFailed = 0;
  
  for (const product of products) {
    console.log(`\nProcessing: ${product.title} (ID: ${product.id})`);
    
    let updatedImage = product.image;
    let updatedAdditionalImages = product.additionalImages;
    let hasChanges = false;
    
    if (product.image && !product.image.startsWith('data:image/webp')) {
      console.log("  Main image:");
      const imageBuffer = await downloadImage(product.image);
      if (imageBuffer) {
        totalOriginalSize += imageBuffer.length;
        try {
          updatedImage = await compressImage(imageBuffer);
          const compressedBuffer = Buffer.from(updatedImage.split(',')[1], 'base64');
          totalCompressedSize += compressedBuffer.length;
          hasChanges = true;
          imagesProcessed++;
        } catch (e) {
          imagesFailed++;
        }
      }
    } else if (product.image?.startsWith('data:image/webp')) {
      console.log("  Main image: Already compressed (webp)");
    }
    
    if (product.additionalImages && product.additionalImages.length > 0) {
      const compressedAdditional: string[] = [];
      
      for (let i = 0; i < product.additionalImages.length; i++) {
        const imgUrl = product.additionalImages[i];
        console.log(`  Additional image ${i + 1}:`);
        
        if (imgUrl.startsWith('data:image/webp')) {
          console.log("    Already compressed (webp)");
          compressedAdditional.push(imgUrl);
          continue;
        }
        
        const imageBuffer = await downloadImage(imgUrl);
        if (imageBuffer) {
          totalOriginalSize += imageBuffer.length;
          try {
            const compressed = await compressImage(imageBuffer);
            const compressedBuffer = Buffer.from(compressed.split(',')[1], 'base64');
            totalCompressedSize += compressedBuffer.length;
            compressedAdditional.push(compressed);
            hasChanges = true;
            imagesProcessed++;
          } catch (e) {
            compressedAdditional.push(imgUrl);
            imagesFailed++;
          }
        } else {
          compressedAdditional.push(imgUrl);
        }
      }
      
      updatedAdditionalImages = compressedAdditional;
    }
    
    if (hasChanges) {
      await db.update(productsTable)
        .set({ 
          image: updatedImage,
          additionalImages: updatedAdditionalImages
        })
        .where(eq(productsTable.id, product.id));
      console.log("  Database updated!");
    }
  }
  
  console.log("\n========================================");
  console.log("COMPRESSION COMPLETE");
  console.log("========================================");
  console.log(`Images processed: ${imagesProcessed}`);
  console.log(`Images failed: ${imagesFailed}`);
  if (totalOriginalSize > 0) {
    console.log(`Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total compressed size: ${(totalCompressedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total savings: ${((totalOriginalSize - totalCompressedSize) / 1024 / 1024).toFixed(2)} MB (${((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(1)}%)`);
  }
  
  await pool.end();
  process.exit(0);
}

compressAllProductImages().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
