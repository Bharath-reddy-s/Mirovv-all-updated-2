import { type StockStatus, type Product, type CreateProduct, type UpdateProduct, products as initialProducts, productsTable } from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq } from "drizzle-orm";
import ws from "ws";

const sql = drizzle({
  connection: process.env.DATABASE_URL!,
  ws: ws,
});

export interface IStorage {
  getStockStatus(): Promise<StockStatus>;
  updateStockStatus(productId: number, isInStock: boolean): Promise<StockStatus>;
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: CreateProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<UpdateProduct>): Promise<Product | undefined>;
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
    const products = await sql.select().from(productsTable);
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
}

export const storage = new DBStorage();
