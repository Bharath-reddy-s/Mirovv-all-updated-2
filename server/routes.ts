import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { updateStockStatusSchema } from "@shared/schema";

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

  const httpServer = createServer(app);

  return httpServer;
}
