import { db } from "./db";
import { type StockStatus, type Product, type CreateProduct, type UpdateProduct, type Review, type InsertReview, type PriceFilter, type InsertPriceFilter, type PromotionalSettings, type InsertPromotionalSettings, type Order, type InsertOrder, type FlashOffer, type DeliveryAddress, type InsertDeliveryAddress, type TimeChallenge, type CheckoutDiscount, type Offer, type InsertOffer, type UpdateOffer, type ShopPopup, products as initialProducts, productsTable, reviewsTable, priceFiltersTable, promotionalSettingsTable, ordersTable, flashOffersTable, deliveryAddressesTable, timeChallengeTable, checkoutDiscountTable, offersTable, shopPopupTable } from "@shared/schema";
import { eq, asc, desc, sql as sqlOp, avg, count } from "drizzle-orm";
import { compressProductImages, compressOfferImages } from "./image-compression";

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
  offers: CacheEntry<Offer[]> | null;
} = {
  products: null,
  stock: null,
  priceFilters: null,
  promotionalSettings: null,
  deliveryAddresses: null,
  offers: null,
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

function invalidateOffersCache() {
  cache.offers = null;
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
      db.select().from(productsTable).orderBy(asc(productsTable.displayOrder)),
      db.select().from(priceFiltersTable).orderBy(asc(priceFiltersTable.displayOrder)),
      db.select().from(promotionalSettingsTable).limit(1),
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
  getCheckoutDiscount(): Promise<CheckoutDiscount>;
  updateCheckoutDiscount(discountPercent: number): Promise<CheckoutDiscount>;
  getOffers(): Promise<Offer[]>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  updateOffer(id: number, updates: Partial<UpdateOffer>): Promise<Offer | undefined>;
  deleteOffer(id: number): Promise<boolean>;
  reorderOffers(offerId: number, direction: 'up' | 'down'): Promise<Offer[]>;
  setOfferPosition(offerId: number, newPosition: number): Promise<Offer[]>;
  getShopPopup(): Promise<ShopPopup>;
  updateShopPopup(isActive: boolean, imageUrl: string | null, showOn?: string): Promise<ShopPopup>;
}

export class DBStorage implements IStorage {
  async getStockStatus(): Promise<StockStatus> {
    if (isCacheValid(cache.stock)) {
      return cache.stock.data;
    }
    const products = await db.select().from(productsTable);
    const status: StockStatus = {};
    products.forEach(p => {
      status[p.id] = p.isInStock;
    });
    cache.stock = { data: status, timestamp: Date.now() };
    return status;
  }

  async updateStockStatus(productId: number, isInStock: boolean): Promise<StockStatus> {
    await db.update(productsTable)
      .set({ isInStock })
      .where(eq(productsTable.id, productId));
    invalidateProductCache();
    return this.getStockStatus();
  }

  async getProducts(): Promise<Product[]> {
    if (isCacheValid(cache.products)) {
      return cache.products.data;
    }
    const products = await db.select().from(productsTable).orderBy(asc(productsTable.displayOrder)) as Product[];
    cache.products = { data: products, timestamp: Date.now() };
    return products;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    if (isCacheValid(cache.products)) {
      return cache.products.data.find(p => p.id === id);
    }
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    return product as Product | undefined;
  }

  async getProductByCode(code: string): Promise<Product | undefined> {
    if (isCacheValid(cache.products)) {
      return cache.products.data.find(p => p.productCode === code);
    }
    const [product] = await db.select().from(productsTable).where(eq(productsTable.productCode, code));
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
    
    const [newProduct] = await db.insert(productsTable)
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
    
    const [updated] = await db.update(productsTable)
      .set(finalUpdates)
      .where(eq(productsTable.id, id))
      .returning();
    invalidateProductCache();
    return updated as Product | undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(productsTable)
      .where(eq(productsTable.id, id))
      .returning();
    invalidateProductCache();
    return result.length > 0;
  }

  async reorderProducts(productId: number, direction: 'up' | 'down'): Promise<Product[]> {
    const allProducts = await db.select().from(productsTable).orderBy(asc(productsTable.displayOrder));
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

    await db.update(productsTable)
      .set({ displayOrder: targetProduct.displayOrder })
      .where(eq(productsTable.id, currentProduct.id));

    await db.update(productsTable)
      .set({ displayOrder: currentProduct.displayOrder })
      .where(eq(productsTable.id, targetProduct.id));

    invalidateProductCache();
    return this.getProducts();
  }

  async setProductPosition(productId: number, newPosition: number): Promise<Product[]> {
    const allProducts = await db.select().from(productsTable).orderBy(asc(productsTable.displayOrder));
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

    const currentProduct = allProducts[currentIndex];
    const targetProduct = allProducts[targetIndex];

    // Swap displayOrder values between the two products
    await Promise.all([
      db.update(productsTable)
        .set({ displayOrder: targetProduct.displayOrder })
        .where(eq(productsTable.id, currentProduct.id)),
      db.update(productsTable)
        .set({ displayOrder: currentProduct.displayOrder })
        .where(eq(productsTable.id, targetProduct.id))
    ]);

    invalidateProductCache();
    return this.getProducts();
  }

  async getReviews(productId: number): Promise<Review[]> {
    const reviews = await db.select()
      .from(reviewsTable)
      .where(eq(reviewsTable.productId, productId))
      .orderBy(desc(reviewsTable.createdAt));
    return reviews as Review[];
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviewsTable)
      .values(reviewData)
      .returning();
    return newReview as Review;
  }

  async deleteReview(id: number): Promise<boolean> {
    const result = await db.delete(reviewsTable)
      .where(eq(reviewsTable.id, id))
      .returning();
    return result.length > 0;
  }

  async getReviewStats(productId: number): Promise<{ averageRating: number; totalReviews: number }> {
    const [result] = await db.select({
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
    const filters = await db.select().from(priceFiltersTable).orderBy(asc(priceFiltersTable.displayOrder));
    cache.priceFilters = { data: filters as PriceFilter[], timestamp: Date.now() };
    return filters as PriceFilter[];
  }

  async createPriceFilter(filterData: InsertPriceFilter): Promise<PriceFilter> {
    const maxOrder = await db.select({ max: sqlOp<number>`max(${priceFiltersTable.displayOrder})` }).from(priceFiltersTable);
    const nextOrder = (maxOrder[0]?.max ?? -1) + 1;
    
    const [newFilter] = await db.insert(priceFiltersTable)
      .values({ ...filterData, displayOrder: nextOrder })
      .returning();
    invalidatePriceFilterCache();
    return newFilter as PriceFilter;
  }

  async updatePriceFilter(id: number, value: number): Promise<PriceFilter | undefined> {
    const [updated] = await db.update(priceFiltersTable)
      .set({ value })
      .where(eq(priceFiltersTable.id, id))
      .returning();
    invalidatePriceFilterCache();
    return updated as PriceFilter | undefined;
  }

  async deletePriceFilter(id: number): Promise<boolean> {
    const result = await db.delete(priceFiltersTable)
      .where(eq(priceFiltersTable.id, id))
      .returning();
    invalidatePriceFilterCache();
    return result.length > 0;
  }

  async getPromotionalSettings(): Promise<PromotionalSettings> {
    if (isCacheValid(cache.promotionalSettings)) {
      return cache.promotionalSettings.data;
    }
    const [settings] = await db.select().from(promotionalSettingsTable).limit(1);
    if (!settings) {
      const [newSettings] = await db.insert(promotionalSettingsTable).values({
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
    const [updated] = await db.update(promotionalSettingsTable)
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
      
      const existing = await db.select()
        .from(ordersTable)
        .where(eq(ordersTable.orderNumber, orderNumber))
        .limit(1);
      
      if (existing.length === 0) {
        isUnique = true;
      }
    }
    
    const [newOrder] = await db.insert(ordersTable)
      .values({ ...orderData, orderNumber } as any)
      .returning();
    return newOrder as Order;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.orderNumber, orderNumber))
      .limit(1);
    return order as Order | undefined;
  }

  async getFlashOffer(): Promise<FlashOffer | null> {
    const [offer] = await db.select().from(flashOffersTable).limit(1);
    if (!offer) {
      return null;
    }
    if (offer.isActive && offer.endsAt) {
      const now = new Date();
      if (now > offer.endsAt) {
        await db.update(flashOffersTable)
          .set({ isActive: false })
          .where(eq(flashOffersTable.id, offer.id));
        return { ...offer, isActive: false } as FlashOffer;
      }
    }
    return offer as FlashOffer;
  }

  async startFlashOffer(maxClaims?: number, durationSeconds?: number, bannerText?: string): Promise<FlashOffer> {
    const existing = await db.select().from(flashOffersTable).limit(1);
    const now = new Date();
    const duration = durationSeconds ?? 30;
    const slots = maxClaims ?? 5;
    const text = bannerText ?? "First 5 orders are FREE!";
    const endsAt = new Date(now.getTime() + duration * 1000);
    
    if (existing.length > 0) {
      const [updated] = await db.update(flashOffersTable)
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
      const [created] = await db.insert(flashOffersTable)
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
    const [existing] = await db.select().from(flashOffersTable).limit(1);
    if (!existing) {
      return null;
    }
    const [updated] = await db.update(flashOffersTable)
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
      await db.update(flashOffersTable)
        .set({ isActive: false })
        .where(eq(flashOffersTable.id, offer.id));
      return { success: false, flashOffer: { ...offer, isActive: false }, spotsRemaining: 0 };
    }
    const [updated] = await db.update(flashOffersTable)
      .set({ claimedCount: offer.claimedCount + 1 })
      .where(eq(flashOffersTable.id, offer.id))
      .returning();
    const spotsRemaining = updated.maxClaims - updated.claimedCount;
    if (spotsRemaining <= 0) {
      await db.update(flashOffersTable)
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
    const addresses = await db.select().from(deliveryAddressesTable).orderBy(asc(deliveryAddressesTable.displayOrder));
    cache.deliveryAddresses = { data: addresses as DeliveryAddress[], timestamp: Date.now() };
    return addresses as DeliveryAddress[];
  }

  async createDeliveryAddress(addressData: InsertDeliveryAddress): Promise<DeliveryAddress> {
    const maxOrder = await db.select({ max: sqlOp<number>`max(${deliveryAddressesTable.displayOrder})` }).from(deliveryAddressesTable);
    const nextOrder = (maxOrder[0]?.max ?? -1) + 1;
    
    const [newAddress] = await db.insert(deliveryAddressesTable)
      .values({ ...addressData, displayOrder: nextOrder })
      .returning();
    invalidateDeliveryAddressCache();
    return newAddress as DeliveryAddress;
  }

  async updateDeliveryAddress(id: number, name: string): Promise<DeliveryAddress | undefined> {
    const [updated] = await db.update(deliveryAddressesTable)
      .set({ name })
      .where(eq(deliveryAddressesTable.id, id))
      .returning();
    invalidateDeliveryAddressCache();
    return updated as DeliveryAddress | undefined;
  }

  async deleteDeliveryAddress(id: number): Promise<boolean> {
    const result = await db.delete(deliveryAddressesTable)
      .where(eq(deliveryAddressesTable.id, id))
      .returning();
    invalidateDeliveryAddressCache();
    return result.length > 0;
  }

  async getTimeChallenge(): Promise<TimeChallenge | null> {
    const [challenge] = await db.select().from(timeChallengeTable).limit(1);
    if (!challenge) {
      return null;
    }
    return challenge as TimeChallenge;
  }

  async updateTimeChallenge(settings: { name?: string; isActive?: boolean; durationSeconds?: number; discountPercent?: number }): Promise<TimeChallenge> {
    const [updated] = await db.update(timeChallengeTable)
      .set(settings)
      .where(eq(timeChallengeTable.id, 1))
      .returning();
    return updated as TimeChallenge;
  }

  async getCheckoutDiscount(): Promise<CheckoutDiscount> {
    const [discount] = await db.select().from(checkoutDiscountTable).limit(1);
    if (!discount) {
      const [newDiscount] = await db.insert(checkoutDiscountTable).values({ discountPercent: 0 }).returning();
      return newDiscount as CheckoutDiscount;
    }
    return discount as CheckoutDiscount;
  }

  async updateCheckoutDiscount(discountPercent: number): Promise<CheckoutDiscount> {
    const [updated] = await db.update(checkoutDiscountTable)
      .set({ discountPercent })
      .where(eq(checkoutDiscountTable.id, 1))
      .returning();
    return updated as CheckoutDiscount;
  }

  async getOffers(): Promise<Offer[]> {
    if (isCacheValid(cache.offers)) {
      return cache.offers.data;
    }
    const offers = await db.select().from(offersTable).orderBy(asc(offersTable.displayOrder));
    cache.offers = { data: offers as Offer[], timestamp: Date.now() };
    return offers as Offer[];
  }

  async createOffer(offerData: InsertOffer): Promise<Offer> {
    const maxOrder = await db.select({ max: sqlOp<number>`max(${offersTable.displayOrder})` }).from(offersTable);
    const nextOrder = (maxOrder[0]?.max ?? -1) + 1;
    
    const compressed = await compressOfferImages(offerData.images);
    
    const [newOffer] = await db.insert(offersTable)
      .values({ 
        ...offerData, 
        images: compressed,
        displayOrder: nextOrder 
      })
      .returning();
    invalidateOffersCache();
    return newOffer as Offer;
  }

  async updateOffer(id: number, updates: Partial<UpdateOffer>): Promise<Offer | undefined> {
    let finalUpdates = { ...updates };
    
    if (updates.images) {
      finalUpdates.images = await compressOfferImages(updates.images);
    }
    
    const [updated] = await db.update(offersTable)
      .set(finalUpdates)
      .where(eq(offersTable.id, id))
      .returning();
    invalidateOffersCache();
    return updated as Offer | undefined;
  }

  async deleteOffer(id: number): Promise<boolean> {
    const result = await db.delete(offersTable)
      .where(eq(offersTable.id, id))
      .returning();
    invalidateOffersCache();
    return result.length > 0;
  }

  async reorderOffers(offerId: number, direction: 'up' | 'down'): Promise<Offer[]> {
    const offers = await this.getOffers();
    const currentIndex = offers.findIndex(o => o.id === offerId);
    
    if (currentIndex === -1) return offers;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= offers.length) return offers;
    
    const currentOffer = offers[currentIndex];
    const swapOffer = offers[newIndex];
    
    await db.update(offersTable)
      .set({ displayOrder: swapOffer.displayOrder })
      .where(eq(offersTable.id, currentOffer.id));
    
    await db.update(offersTable)
      .set({ displayOrder: currentOffer.displayOrder })
      .where(eq(offersTable.id, swapOffer.id));
    
    invalidateOffersCache();
    return this.getOffers();
  }

  async setOfferPosition(offerId: number, newPosition: number): Promise<Offer[]> {
    const allOffers = await this.getOffers();
    const currentIndex = allOffers.findIndex(o => o.id === offerId);
    
    if (currentIndex === -1) {
      throw new Error('Offer not found');
    }

    const targetIndex = newPosition - 1;
    
    if (targetIndex < 0 || targetIndex >= allOffers.length) {
      throw new Error('Invalid position');
    }

    if (currentIndex === targetIndex) {
      return allOffers;
    }

    // Remove offer from current position and insert at target position
    const [movingOffer] = allOffers.splice(currentIndex, 1);
    allOffers.splice(targetIndex, 0, movingOffer);

    // Re-assign sequential displayOrder values to all offers in parallel
    await Promise.all(
      allOffers.map((offer, i) =>
        db.update(offersTable)
          .set({ displayOrder: i })
          .where(eq(offersTable.id, offer.id))
      )
    );

    invalidateOffersCache();
    return this.getOffers();
  }

  async getShopPopup(): Promise<ShopPopup> {
    const [popup] = await db.select().from(shopPopupTable).limit(1);
    if (!popup) {
      const [newPopup] = await db.insert(shopPopupTable).values({
        isHomeActive: false,
        isShopActive: false,
        imageUrl: null,
        homeImageUrl: null,
      }).returning();
      return newPopup as ShopPopup;
    }
    return popup as ShopPopup;
  }

  async updateShopPopup(isHomeActive: boolean, isShopActive: boolean, imageUrl: string | null, homeImageUrl?: string | null): Promise<ShopPopup> {
    const updateData: any = { isHomeActive, isShopActive, imageUrl };
    if (homeImageUrl !== undefined) {
      updateData.homeImageUrl = homeImageUrl;
    }
    
    const [updated] = await db.update(shopPopupTable)
      .set(updateData)
      .where(eq(shopPopupTable.id, 1))
      .returning();
    return updated as ShopPopup;
  }
}

export const storage = new DBStorage();
