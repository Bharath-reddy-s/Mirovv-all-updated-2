import { type StockStatus } from "@shared/schema";

export interface IStorage {
  getStockStatus(): Promise<StockStatus>;
  updateStockStatus(productId: number, isInStock: boolean): Promise<StockStatus>;
}

export class MemStorage implements IStorage {
  private stockStatus: StockStatus;

  constructor() {
    this.stockStatus = { 1: true, 2: true, 3: false };
  }

  async getStockStatus(): Promise<StockStatus> {
    return { ...this.stockStatus };
  }

  async updateStockStatus(productId: number, isInStock: boolean): Promise<StockStatus> {
    this.stockStatus[productId] = isInStock;
    return { ...this.stockStatus };
  }
}

export const storage = new MemStorage();
