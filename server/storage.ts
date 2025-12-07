import { type StockStatus, type Product, type CreateProduct, type UpdateProduct, type Review, type InsertReview, type PriceFilter, type InsertPriceFilter, type PromotionalSettings, type InsertPromotionalSettings, type Order, type InsertOrder, type FlashOffer, type DeliveryAddress, type InsertDeliveryAddress, type TimeChallenge, products as initialProducts, productsTable, reviewsTable, priceFiltersTable, promotionalSettingsTable, ordersTable, flashOffersTable, deliveryAddressesTable, timeChallengeTable } from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq, asc, desc, sql as sqlOp, avg, count } from "drizzle-orm";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { compressProductImages } from "./image-compression";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

neonConfig.webSocketConstructor = ws;

const dbUrl = process.env.DATABASE_URL.trim().replace(/^['"]|['"]$/g, '');

console.log("Connecting to database...");

const pool = new Pool({ connectionString: dbUrl });
pool.on('error', (err) => console.error('Database pool error:', err));

const sql = drizzle({ client: pool });

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 300000; // 5 minutes cache

const cache: {
  products: CacheEntry<Product[]> | null;
  stock: CacheEntry<StockStatus> | null;
  priceFilters: CacheEntry<PriceFilter[]> | null;
  promotionalSettings: CacheEntry<PromotionalSettings> | null;
  deliveryAddresses: CacheEntry<DeliveryAddress[]> | null;
} = {
  products: null,
  stock: null,
  priceFilters: null,
  promotionalSettings: null,
  deliveryAddresses: null,
};

function isCacheValid<T>(entry: CacheEntry<T> | null): entry is CacheEntry<T> {
  return entry !== null && (Date.now() - entry.timestamp) < CACHE_TTL;
}

function invalidateProductCache() {
  cache.products = null;
  cache.stock = null;
}

function invalidatePriceFilterCache() {
  cache.priceFilters = null;
}

function invalidatePromotionalCache() {
  cache.promotionalSettings = null;
}

function invalidateDeliveryAddressCache() {
  cache.deliveryAddresses = null;
}

function parsePriceToNumber(priceStr: string): number {
  const cleanedValue = priceStr.replace(/[^\d]/g, '');
  return parseInt(cleanedValue, 10) || 0;
}

export async function warmupCache(): Promise<void> {
  console.log('Warming up cache...');
  const start = Date.now();
  
  try {
    const [products, priceFilters, settings] = await Promise.all([
      sql.select().from(productsTable).orderBy(asc(productsTable.displayOrder)),
      sql.select().from(priceFiltersTable).orderBy(asc(priceFiltersTable.displayOrder)),
      sql.select().from(promotionalSettingsTable).limit(1),
    ]);
    
    cache.products = { data: products as Product[], timestamp: Date.now() };
    
    const stockStatus: StockStatus = {};
    products.forEach(p => {
      stockStatus[p.id] = p.isInStock;
    });
    cache.stock = { data: stockStatus, timestamp: Date.now() };
    
    cache.priceFilters = { data: priceFilters as PriceFilter[], timestamp: Date.now() };
    
    if (settings.length > 0) {
      cache.promotionalSettings = { data: settings[0] as PromotionalSettings, timestamp: Date.now() };
    }
    
    console.log(`Cache warmed up in ${Date.now() - start}ms`);
  } catch (error) {
    console.error('Cache warmup failed:', error);
  }
}

export interface IStorage {
  getStockStatus(): Promise<StockStatus>;
  updateStockStatus(productId: number, isInStock: boolean): Promise<StockStatus>;
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getSimilarProducts(productId: number, limit?: number): Promise<Product[]>;
  createProduct(product: CreateProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<UpdateProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  reorderProducts(productId: number, direction: 'up' | 'down'): Promise<Product[]>;
  setProductPosition(productId: number, newPosition: number): Promise<Product[]>;
  getReviews(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  deleteReview(id: number): Promise<boolean>;
  getReviewStats(productId: number): Promise<{ averageRating: number; totalReviews: number }>;
  getPriceFilters(): Promise<PriceFilter[]>;
  createPriceFilter(filter: InsertPriceFilter): Promise<PriceFilter>;
  updatePriceFilter(id: number, value: number): Promise<PriceFilter | undefined>;
  deletePriceFilter(id: number): Promise<boolean>;
  getPromotionalSettings(): Promise<PromotionalSettings>;
  updatePromotionalSettings(bannerText: string, timerSeconds: number, deliveryText: string): Promise<PromotionalSettings>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  getFlashOffer(): Promise<FlashOffer | null>;
  startFlashOffer(maxClaims?: number, durationSeconds?: number, bannerText?: string): Promise<FlashOffer>;
  stopFlashOffer(): Promise<FlashOffer | null>;
  claimFlashOffer(): Promise<{ success: boolean; flashOffer: FlashOffer | null; spotsRemaining: number }>;
  getDeliveryAddresses(): Promise<DeliveryAddress[]>;
  createDeliveryAddress(address: InsertDeliveryAddress): Promise<DeliveryAddress>;
  updateDeliveryAddress(id: number, name: string): Promise<DeliveryAddress | undefined>;
  deleteDeliveryAddress(id: number): Promise<boolean>;
  getTimeChallenge(): Promise<TimeChallenge | null>;
  updateTimeChallenge(settings: { name?: string; isActive?: boolean; durationSeconds?: number; discountPercent?: number }): Promise<TimeChallenge>;
}

export class DBStorage implements IStorage {
  async getStockStatus(): Promise<StockStatus> {
    if (isCacheValid(cache.stock)) {
      return cache.stock.data;
    }
    const products = await sql.select().from(productsTable);
    const status: StockStatus = {};
    products.forEach(p => {
      status[p.id] = p.isInStock;
    });
    cache.stock = { data: status, timestamp: Date.now() };
    return status;
  }

  async updateStockStatus(productId: number, isInStock: boolean): Promise<StockStatus> {
    await sql.update(productsTable)
      .set({ isInStock })
      .where(eq(productsTable.id, productId));
    invalidateProductCache();
    return this.getStockStatus();
  }

  async getProducts(): Promise<Product[]> {
    if (isCacheValid(cache.products)) {
      return cache.products.data;
    }
    const products = await sql.select().from(productsTable).orderBy(asc(productsTable.displayOrder)) as Product[];
    cache.products = { data: products, timestamp: Date.now() };
    return products;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    if (isCacheValid(cache.products)) {
      return cache.products.data.find(p => p.id === id);
    }
    const [product] = await sql.select().from(productsTable).where(eq(productsTable.id, id));
    return product as Product | undefined;
  }

  async getSimilarProducts(productId: number, limit: number = 6): Promise<Product[]> {
    const currentProduct = await this.getProductById(productId);
    if (!currentProduct) {
      return [];
    }

    const currentPrice = parsePriceToNumber(currentProduct.price);
    const priceRange = currentPrice * 0.5;
    const minPrice = currentPrice - priceRange;
    const maxPrice = currentPrice + priceRange;

    const allProducts = await this.getProducts();
    
    const similarProducts = allProducts
      .filter(p => p.id !== productId)
      .map(p => ({
        product: p,
        price: parsePriceToNumber(p.price),
        priceDiff: Math.abs(parsePriceToNumber(p.price) - currentPrice)
      }))
      .filter(item => item.price >= minPrice && item.price <= maxPrice)
      .sort((a, b) => a.priceDiff - b.priceDiff)
      .slice(0, limit)
      .map(item => item.product);

    if (similarProducts.length < limit) {
      const remaining = limit - similarProducts.length;
      const existingIds = new Set([productId, ...similarProducts.map(p => p.id)]);
      
      const additionalProducts = allProducts
        .filter(p => !existingIds.has(p.id))
        .map(p => ({
          product: p,
          priceDiff: Math.abs(parsePriceToNumber(p.price) - currentPrice)
        }))
        .sort((a, b) => a.priceDiff - b.priceDiff)
        .slice(0, remaining)
        .map(item => item.product);
      
      similarProducts.push(...additionalProducts);
    }

    return similarProducts;
  }

  async createProduct(productData: CreateProduct): Promise<Product> {
    const compressed = await compressProductImages(
      productData.image,
      productData.additionalImages
    );
    
    const [newProduct] = await sql.insert(productsTable)
      .values({
        ...productData,
        image: compressed.image,
        additionalImages: compressed.additionalImages
      })
      .returning();
    invalidateProductCache();
    return newProduct as Product;
  }

  async updateProduct(id: number, updates: Partial<UpdateProduct>): Promise<Product | undefined> {
    let finalUpdates = { ...updates };
    
    if (updates.image || updates.additionalImages) {
      const compressed = await compressProductImages(
        updates.image || '',
        updates.additionalImages
      );
      
      if (updates.image) {
        finalUpdates.image = compressed.image;
      }
      if (updates.additionalImages) {
        finalUpdates.additionalImages = compressed.additionalImages || undefined;
      }
    }
    
    const [updated] = await sql.update(productsTable)
      .set(finalUpdates)
      .where(eq(productsTable.id, id))
      .returning();
    invalidateProductCache();
    return updated as Product | undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await sql.delete(productsTable)
      .where(eq(productsTable.id, id))
      .returning();
    invalidateProductCache();
    return result.length > 0;
  }

  async reorderProducts(productId: number, direction: 'up' | 'down'): Promise<Product[]> {
    const allProducts = await sql.select().from(productsTable).orderBy(asc(productsTable.displayOrder));
    const currentIndex = allProducts.findIndex(p => p.id === productId);
    
    if (currentIndex === -1) {
      throw new Error('Product not found');
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= allProducts.length) {
      return allProducts;
    }

    const currentProduct = allProducts[currentIndex];
    const targetProduct = allProducts[targetIndex];

    await sql.update(productsTable)
      .set({ displayOrder: targetProduct.displayOrder })
      .where(eq(productsTable.id, currentProduct.id));

    await sql.update(productsTable)
      .set({ displayOrder: currentProduct.displayOrder })
      .where(eq(productsTable.id, targetProduct.id));

    invalidateProductCache();
    return this.getProducts();
  }

  async setProductPosition(productId: number, newPosition: number): Promise<Product[]> {
    const allProducts = await sql.select().from(productsTable).orderBy(asc(productsTable.displayOrder));
    const currentIndex = allProducts.findIndex(p => p.id === productId);
    
    if (currentIndex === -1) {
      throw new Error('Product not found');
    }

    const targetIndex = newPosition - 1;
    
    if (targetIndex < 0 || targetIndex >= allProducts.length) {
      throw new Error('Invalid position');
    }

    if (currentIndex === targetIndex) {
      return allProducts;
    }

    const movingProduct = allProducts[currentIndex];
    const newDisplayOrder = allProducts[targetIndex].displayOrder;

    if (currentIndex < targetIndex) {
      for (let i = currentIndex + 1; i <= targetIndex; i++) {
        await sql.update(productsTable)
          .set({ displayOrder: allProducts[i - 1].displayOrder })
          .where(eq(productsTable.id, allProducts[i].id));
      }
    } else {
      for (let i = currentIndex - 1; i >= targetIndex; i--) {
        await sql.update(productsTable)
          .set({ displayOrder: allProducts[i + 1].displayOrder })
          .where(eq(productsTable.id, allProducts[i].id));
      }
    }

    await sql.update(productsTable)
      .set({ displayOrder: newDisplayOrder })
      .where(eq(productsTable.id, movingProduct.id));

    invalidateProductCache();
    return this.getProducts();
  }

  async getReviews(productId: number): Promise<Review[]> {
    const reviews = await sql.select()
      .from(reviewsTable)
      .where(eq(reviewsTable.productId, productId))
      .orderBy(desc(reviewsTable.createdAt));
    return reviews as Review[];
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const [newReview] = await sql.insert(reviewsTable)
      .values(reviewData)
      .returning();
    return newReview as Review;
  }

  async deleteReview(id: number): Promise<boolean> {
    const result = await sql.delete(reviewsTable)
      .where(eq(reviewsTable.id, id))
      .returning();
    return result.length > 0;
  }

  async getReviewStats(productId: number): Promise<{ averageRating: number; totalReviews: number }> {
    const [result] = await sql.select({
      averageRating: avg(reviewsTable.rating),
      totalReviews: count(reviewsTable.id),
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.productId, productId));
    
    return {
      averageRating: result?.averageRating ? Number(result.averageRating) : 0,
      totalReviews: result?.totalReviews ? Number(result.totalReviews) : 0,
    };
  }

  async getPriceFilters(): Promise<PriceFilter[]> {
    if (isCacheValid(cache.priceFilters)) {
      return cache.priceFilters.data;
    }
    const filters = await sql.select().from(priceFiltersTable).orderBy(asc(priceFiltersTable.displayOrder));
    cache.priceFilters = { data: filters as PriceFilter[], timestamp: Date.now() };
    return filters as PriceFilter[];
  }

  async createPriceFilter(filterData: InsertPriceFilter): Promise<PriceFilter> {
    const maxOrder = await sql.select({ max: sqlOp<number>`max(${priceFiltersTable.displayOrder})` }).from(priceFiltersTable);
    const nextOrder = (maxOrder[0]?.max ?? -1) + 1;
    
    const [newFilter] = await sql.insert(priceFiltersTable)
      .values({ ...filterData, displayOrder: nextOrder })
      .returning();
    invalidatePriceFilterCache();
    return newFilter as PriceFilter;
  }

  async updatePriceFilter(id: number, value: number): Promise<PriceFilter | undefined> {
    const [updated] = await sql.update(priceFiltersTable)
      .set({ value })
      .where(eq(priceFiltersTable.id, id))
      .returning();
    invalidatePriceFilterCache();
    return updated as PriceFilter | undefined;
  }

  async deletePriceFilter(id: number): Promise<boolean> {
    const result = await sql.delete(priceFiltersTable)
      .where(eq(priceFiltersTable.id, id))
      .returning();
    invalidatePriceFilterCache();
    return result.length > 0;
  }

  async getPromotionalSettings(): Promise<PromotionalSettings> {
    if (isCacheValid(cache.promotionalSettings)) {
      return cache.promotionalSettings.data;
    }
    const [settings] = await sql.select().from(promotionalSettingsTable).limit(1);
    if (!settings) {
      const [newSettings] = await sql.insert(promotionalSettingsTable).values({
        bannerText: "₹10 off on every product",
        timerSeconds: 604800,
        deliveryText: "Shop for ₹199 and get free delivery",
      }).returning();
      cache.promotionalSettings = { data: newSettings as PromotionalSettings, timestamp: Date.now() };
      return newSettings as PromotionalSettings;
    }
    cache.promotionalSettings = { data: settings as PromotionalSettings, timestamp: Date.now() };
    return settings as PromotionalSettings;
  }

  async updatePromotionalSettings(bannerText: string, timerSeconds: number, deliveryText: string): Promise<PromotionalSettings> {
    const timerEndTime = new Date(Date.now() + (timerSeconds * 1000));
    const [updated] = await sql.update(promotionalSettingsTable)
      .set({ bannerText, timerSeconds, timerEndTime, deliveryText })
      .where(eq(promotionalSettingsTable.id, 1))
      .returning();
    invalidatePromotionalCache();
    return updated as PromotionalSettings;
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    let orderNumber = "";
    let isUnique = false;
    
    while (!isUnique) {
      orderNumber = Math.floor(10000 + Math.random() * 90000).toString();
      
      const existing = await sql.select()
        .from(ordersTable)
        .where(eq(ordersTable.orderNumber, orderNumber))
        .limit(1);
      
      if (existing.length === 0) {
        isUnique = true;
      }
    }
    
    const [newOrder] = await sql.insert(ordersTable)
      .values({ ...orderData, orderNumber } as any)
      .returning();
    return newOrder as Order;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await sql.select()
      .from(ordersTable)
      .where(eq(ordersTable.orderNumber, orderNumber))
      .limit(1);
    return order as Order | undefined;
  }

  async getFlashOffer(): Promise<FlashOffer | null> {
    const [offer] = await sql.select().from(flashOffersTable).limit(1);
    if (!offer) {
      return null;
    }
    if (offer.isActive && offer.endsAt) {
      const now = new Date();
      if (now > offer.endsAt) {
        await sql.update(flashOffersTable)
          .set({ isActive: false })
          .where(eq(flashOffersTable.id, offer.id));
        return { ...offer, isActive: false } as FlashOffer;
      }
    }
    return offer as FlashOffer;
  }

  async startFlashOffer(maxClaims?: number, durationSeconds?: number, bannerText?: string): Promise<FlashOffer> {
    const existing = await sql.select().from(flashOffersTable).limit(1);
    const now = new Date();
    const duration = durationSeconds ?? 30;
    const slots = maxClaims ?? 5;
    const text = bannerText ?? "First 5 orders are FREE!";
    const endsAt = new Date(now.getTime() + duration * 1000);
    
    if (existing.length > 0) {
      const [updated] = await sql.update(flashOffersTable)
        .set({ 
          isActive: true, 
          claimedCount: 0,
          maxClaims: slots,
          durationSeconds: duration,
          bannerText: text,
          startedAt: now, 
          endsAt: endsAt 
        })
        .where(eq(flashOffersTable.id, existing[0].id))
        .returning();
      return updated as FlashOffer;
    } else {
      const [created] = await sql.insert(flashOffersTable)
        .values({
          isActive: true,
          maxClaims: slots,
          claimedCount: 0,
          durationSeconds: duration,
          startedAt: now,
          endsAt: endsAt,
          bannerText: text,
        })
        .returning();
      return created as FlashOffer;
    }
  }

  async stopFlashOffer(): Promise<FlashOffer | null> {
    const [existing] = await sql.select().from(flashOffersTable).limit(1);
    if (!existing) {
      return null;
    }
    const [updated] = await sql.update(flashOffersTable)
      .set({ isActive: false })
      .where(eq(flashOffersTable.id, existing.id))
      .returning();
    return updated as FlashOffer;
  }

  async claimFlashOffer(): Promise<{ success: boolean; flashOffer: FlashOffer | null; spotsRemaining: number }> {
    const offer = await this.getFlashOffer();
    if (!offer || !offer.isActive) {
      return { success: false, flashOffer: null, spotsRemaining: 0 };
    }
    if (offer.claimedCount >= offer.maxClaims) {
      return { success: false, flashOffer: offer, spotsRemaining: 0 };
    }
    const now = new Date();
    if (offer.endsAt && now > offer.endsAt) {
      await sql.update(flashOffersTable)
        .set({ isActive: false })
        .where(eq(flashOffersTable.id, offer.id));
      return { success: false, flashOffer: { ...offer, isActive: false }, spotsRemaining: 0 };
    }
    const [updated] = await sql.update(flashOffersTable)
      .set({ claimedCount: offer.claimedCount + 1 })
      .where(eq(flashOffersTable.id, offer.id))
      .returning();
    const spotsRemaining = updated.maxClaims - updated.claimedCount;
    if (spotsRemaining <= 0) {
      await sql.update(flashOffersTable)
        .set({ isActive: false })
        .where(eq(flashOffersTable.id, offer.id));
    }
    return { 
      success: true, 
      flashOffer: updated as FlashOffer, 
      spotsRemaining: Math.max(0, spotsRemaining) 
    };
  }

  async getDeliveryAddresses(): Promise<DeliveryAddress[]> {
    if (isCacheValid(cache.deliveryAddresses)) {
      return cache.deliveryAddresses.data;
    }
    const addresses = await sql.select().from(deliveryAddressesTable).orderBy(asc(deliveryAddressesTable.displayOrder));
    cache.deliveryAddresses = { data: addresses as DeliveryAddress[], timestamp: Date.now() };
    return addresses as DeliveryAddress[];
  }

  async createDeliveryAddress(addressData: InsertDeliveryAddress): Promise<DeliveryAddress> {
    const maxOrder = await sql.select({ max: sqlOp<number>`max(${deliveryAddressesTable.displayOrder})` }).from(deliveryAddressesTable);
    const nextOrder = (maxOrder[0]?.max ?? -1) + 1;
    
    const [newAddress] = await sql.insert(deliveryAddressesTable)
      .values({ ...addressData, displayOrder: nextOrder })
      .returning();
    invalidateDeliveryAddressCache();
    return newAddress as DeliveryAddress;
  }

  async updateDeliveryAddress(id: number, name: string): Promise<DeliveryAddress | undefined> {
    const [updated] = await sql.update(deliveryAddressesTable)
      .set({ name })
      .where(eq(deliveryAddressesTable.id, id))
      .returning();
    invalidateDeliveryAddressCache();
    return updated as DeliveryAddress | undefined;
  }

  async deleteDeliveryAddress(id: number): Promise<boolean> {
    const result = await sql.delete(deliveryAddressesTable)
      .where(eq(deliveryAddressesTable.id, id))
      .returning();
    invalidateDeliveryAddressCache();
    return result.length > 0;
  }

  async getTimeChallenge(): Promise<TimeChallenge | null> {
    const [challenge] = await sql.select().from(timeChallengeTable).limit(1);
    if (!challenge) {
      return null;
    }
    return challenge as TimeChallenge;
  }

  async updateTimeChallenge(settings: { name?: string; isActive?: boolean; durationSeconds?: number; discountPercent?: number }): Promise<TimeChallenge> {
    const existing = await sql.select().from(timeChallengeTable).limit(1);
    
    // Invalidate product cache since product ordering depends on time challenge state
    invalidateProductCache();
    
    if (existing.length > 0) {
      const [updated] = await sql.update(timeChallengeTable)
        .set(settings)
        .where(eq(timeChallengeTable.id, existing[0].id))
        .returning();
      return updated as TimeChallenge;
    } else {
      const [created] = await sql.insert(timeChallengeTable)
        .values({
          name: settings.name ?? "Time is Money",
          isActive: settings.isActive ?? false,
          durationSeconds: settings.durationSeconds ?? 30,
          discountPercent: settings.discountPercent ?? 30,
        })
        .returning();
      return created as TimeChallenge;
    }
  }
}

export const storage = new DBStorage();
