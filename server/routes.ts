import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { updateStockStatusSchema, createProductSchema, updateProductSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/stock", async (req, res) => {
    try {
      const stockStatus = await storage.getStockStatus();
      res.json(stockStatus);
    } catch (error) {
      res.status(500).json({ error: "Failed to get stock status" });
    }
  });

  app.post("/api/stock", async (req, res) => {
    try {
      const validation = updateStockStatusSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const { productId, isInStock } = validation.data;
      const stockStatus = await storage.updateStockStatus(productId, isInStock);
      res.json(stockStatus);
    } catch (error) {
      res.status(500).json({ error: "Failed to update stock status" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to get products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to get product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validation = createProductSchema.safeParse(req.body);
      if (!validation.success) {
        console.error("Validation failed:", validation.error);
        return res.status(400).json({ error: validation.error });
      }

      const product = await storage.createProduct(validation.data);
      res.json(product);
    } catch (error) {
      console.error("Failed to create product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = updateProductSchema.safeParse({ ...req.body, id });
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const product = await storage.updateProduct(id, validation.data);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
