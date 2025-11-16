import { type User, type InsertUser, type StockStatus } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getStockStatus(): Promise<StockStatus>;
  updateStockStatus(productId: number, isInStock: boolean): Promise<StockStatus>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private stockStatus: StockStatus;

  constructor() {
    this.users = new Map();
    this.stockStatus = { 1: true, 2: true, 3: false };
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
