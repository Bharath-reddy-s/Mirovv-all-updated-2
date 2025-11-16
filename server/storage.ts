import { type StockStatus, type Product, type CreateProduct, type UpdateProduct, products as initialProducts } from "@shared/schema";

export interface IStorage {
  getStockStatus(): Promise<StockStatus>;
  updateStockStatus(productId: number, isInStock: boolean): Promise<StockStatus>;
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: CreateProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<UpdateProduct>): Promise<Product | undefined>;
}

export class MemStorage implements IStorage {
  private stockStatus: StockStatus;
  private products: Product[];
  private nextProductId: number;

  constructor() {
    this.stockStatus = { 1: true, 2: true, 3: false };
    this.products = [...initialProducts];
    this.nextProductId = Math.max(...this.products.map(p => p.id), 0) + 1;
  }

  async getStockStatus(): Promise<StockStatus> {
    return { ...this.stockStatus };
  }

  async updateStockStatus(productId: number, isInStock: boolean): Promise<StockStatus> {
    this.stockStatus[productId] = isInStock;
    return { ...this.stockStatus };
  }

  async getProducts(): Promise<Product[]> {
    return [...this.products];
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.find(p => p.id === id);
  }

  async createProduct(productData: CreateProduct): Promise<Product> {
    const newProduct: Product = {
      id: this.nextProductId++,
      ...productData,
    };
    this.products.push(newProduct);
    this.stockStatus[newProduct.id] = true;
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<UpdateProduct>): Promise<Product | undefined> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    this.products[index] = {
      ...this.products[index],
      ...updates,
    };
    return this.products[index];
  }
}

export const storage = new MemStorage();
