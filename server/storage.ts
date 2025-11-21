import { type StockStatus, type Product, type CreateProduct, type UpdateProduct, type Review, type InsertReview, type PriceFilter, type InsertPriceFilter, products as initialProducts, productsTable, reviewsTable, priceFiltersTable } from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq, asc, desc, sql as sqlOp, avg, count } from "drizzle-orm";
import ws from "ws";

const dbUrl = process.env.DATABASE_URL!.replace(/^['"]|['"]$/g, '');

const sql = drizzle({
  connection: dbUrl,
  ws: ws,
});

export interface IStorage {
  getStockStatus(): Promise<StockStatus>;
  updateStockStatus(productId: number, isInStock: boolean): Promise<StockStatus>;
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: CreateProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<UpdateProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  reorderProducts(productId: number, direction: 'up' | 'down'): Promise<Product[]>;
  getReviews(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  getReviewStats(productId: number): Promise<{ averageRating: number; totalReviews: number }>;
  getPriceFilters(): Promise<PriceFilter[]>;
  createPriceFilter(filter: InsertPriceFilter): Promise<PriceFilter>;
  updatePriceFilter(id: number, value: number): Promise<PriceFilter | undefined>;
  deletePriceFilter(id: number): Promise<boolean>;
}

export class DBStorage implements IStorage {
  async getStockStatus(): Promise<StockStatus> {
    const products = await sql.select().from(productsTable);
    const status: StockStatus = {};
    products.forEach(p => {
      status[p.id] = p.isInStock;
    });
    return status;
  }

  async updateStockStatus(productId: number, isInStock: boolean): Promise<StockStatus> {
    await sql.update(productsTable)
      .set({ isInStock })
      .where(eq(productsTable.id, productId));
    return this.getStockStatus();
  }

  async getProducts(): Promise<Product[]> {
    const products = await sql.select().from(productsTable).orderBy(asc(productsTable.displayOrder));
    return products as Product[];
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await sql.select().from(productsTable).where(eq(productsTable.id, id));
    return product as Product | undefined;
  }

  async createProduct(productData: CreateProduct): Promise<Product> {
    const [newProduct] = await sql.insert(productsTable)
      .values(productData)
      .returning();
    return newProduct as Product;
  }

  async updateProduct(id: number, updates: Partial<UpdateProduct>): Promise<Product | undefined> {
    const [updated] = await sql.update(productsTable)
      .set(updates)
      .where(eq(productsTable.id, id))
      .returning();
    return updated as Product | undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await sql.delete(productsTable)
      .where(eq(productsTable.id, id))
      .returning();
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
    const filters = await sql.select().from(priceFiltersTable).orderBy(asc(priceFiltersTable.displayOrder));
    return filters as PriceFilter[];
  }

  async createPriceFilter(filterData: InsertPriceFilter): Promise<PriceFilter> {
    const maxOrder = await sql.select({ max: sqlOp<number>`max(${priceFiltersTable.displayOrder})` }).from(priceFiltersTable);
    const nextOrder = (maxOrder[0]?.max ?? -1) + 1;
    
    const [newFilter] = await sql.insert(priceFiltersTable)
      .values({ ...filterData, displayOrder: nextOrder })
      .returning();
    return newFilter as PriceFilter;
  }

  async updatePriceFilter(id: number, value: number): Promise<PriceFilter | undefined> {
    const [updated] = await sql.update(priceFiltersTable)
      .set({ value })
      .where(eq(priceFiltersTable.id, id))
      .returning();
    return updated as PriceFilter | undefined;
  }

  async deletePriceFilter(id: number): Promise<boolean> {
    const result = await sql.delete(priceFiltersTable)
      .where(eq(priceFiltersTable.id, id))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DBStorage();
