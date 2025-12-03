import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { productsTable } from "@shared/schema";
import { eq } from "drizzle-orm";
import ws from "ws";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

if (!process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
  throw new Error("ImageKit credentials are required");
}

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;

async function uploadToImageKit(imageData: string, fileName: string): Promise<string | null> {
  try {
    let base64Data: string;
    
    if (imageData.startsWith('data:image/')) {
      base64Data = imageData;
    } else if (imageData.startsWith('/')) {
      console.log(`    Skipping local path: ${imageData}`);
      return null;
    } else if (imageData.startsWith('http')) {
      console.log(`    Downloading from URL...`);
      const response = await fetch(imageData);
      if (!response.ok) {
        console.log(`    Failed to download: ${response.status}`);
        return null;
      }
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      base64Data = `data:${contentType};base64,${base64}`;
    } else {
      console.log(`    Unknown image format`);
      return null;
    }

    const formData = new FormData();
    formData.append('file', base64Data);
    formData.append('fileName', fileName);
    formData.append('folder', '/products');

    const authHeader = 'Basic ' + Buffer.from(IMAGEKIT_PRIVATE_KEY + ':').toString('base64');

    const response = await fetch(IMAGEKIT_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`    Upload failed: ${response.status} - ${errorText}`);
      return null;
    }

    const result = await response.json() as { url: string; size: number };
    console.log(`    Uploaded! Size: ${(result.size / 1024).toFixed(1)}KB`);
    return result.url;
  } catch (error) {
    console.log(`    Upload error: ${error}`);
    return null;
  }
}

function isAlreadyOnImageKit(url: string): boolean {
  return url.includes('imagekit.io') || url.includes('ik.imagekit.io');
}

async function migrateAllImages() {
  console.log("========================================");
  console.log("MIGRATING IMAGES TO IMAGEKIT");
  console.log("========================================\n");
  console.log(`URL Endpoint: ${IMAGEKIT_URL_ENDPOINT}\n`);

  const products = await db.select().from(productsTable);
  console.log(`Found ${products.length} products to process\n`);

  let imagesUploaded = 0;
  let imagesFailed = 0;
  let imagesSkipped = 0;

  for (const product of products) {
    console.log(`\nProcessing: ${product.title} (ID: ${product.id})`);

    let updatedImage = product.image;
    let updatedAdditionalImages = product.additionalImages;
    let hasChanges = false;

    if (product.image && !isAlreadyOnImageKit(product.image)) {
      console.log("  Main image:");
      const fileName = `product-${product.id}-main-${Date.now()}.webp`;
      const newUrl = await uploadToImageKit(product.image, fileName);
      if (newUrl) {
        updatedImage = newUrl;
        hasChanges = true;
        imagesUploaded++;
      } else {
        imagesFailed++;
      }
    } else if (product.image && isAlreadyOnImageKit(product.image)) {
      console.log("  Main image: Already on ImageKit");
      imagesSkipped++;
    }

    if (product.additionalImages && product.additionalImages.length > 0) {
      const newAdditionalImages: string[] = [];

      for (let i = 0; i < product.additionalImages.length; i++) {
        const imgUrl = product.additionalImages[i];
        console.log(`  Additional image ${i + 1}:`);

        if (isAlreadyOnImageKit(imgUrl)) {
          console.log("    Already on ImageKit");
          newAdditionalImages.push(imgUrl);
          imagesSkipped++;
          continue;
        }

        const fileName = `product-${product.id}-additional-${i + 1}-${Date.now()}.webp`;
        const newUrl = await uploadToImageKit(imgUrl, fileName);
        if (newUrl) {
          newAdditionalImages.push(newUrl);
          hasChanges = true;
          imagesUploaded++;
        } else {
          newAdditionalImages.push(imgUrl);
          imagesFailed++;
        }
      }

      updatedAdditionalImages = newAdditionalImages;
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
  console.log("MIGRATION COMPLETE");
  console.log("========================================");
  console.log(`Images uploaded: ${imagesUploaded}`);
  console.log(`Images failed: ${imagesFailed}`);
  console.log(`Images skipped (already on ImageKit): ${imagesSkipped}`);

  await pool.end();
  process.exit(0);
}

migrateAllImages().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
