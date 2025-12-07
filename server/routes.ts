import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { updateStockStatusSchema, createProductSchema, updateProductSchema, insertReviewSchema, insertPriceFilterSchema, insertPromotionalSettingsSchema, insertOrderSchema, insertDeliveryAddressSchema } from "@shared/schema";
import { z } from "zod";
import { sendOrderToTelegram } from "./telegram";

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
      const productsWithoutAdditionalImages = products.map(p => ({
        ...p,
        additionalImages: []
      }));
      res.json(productsWithoutAdditionalImages);
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

  app.get("/api/products/:id/similar", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      
      let limit = 6;
      if (req.query.limit) {
        const parsedLimit = parseInt(req.query.limit as string);
        if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 20) {
          limit = parsedLimit;
        }
      }
      
      const similarProducts = await storage.getSimilarProducts(id, limit);
      res.json(similarProducts);
    } catch (error) {
      console.error("Failed to get similar products:", error);
      res.status(500).json({ error: "Failed to get similar products" });
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

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  app.post("/api/products/reorder", async (req, res) => {
    try {
      const schema = z.object({
        productId: z.number(),
        direction: z.enum(['up', 'down'])
      });

      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const { productId, direction } = validation.data;
      const products = await storage.reorderProducts(productId, direction);
      res.json(products);
    } catch (error) {
      console.error("Failed to reorder products:", error);
      res.status(500).json({ error: "Failed to reorder products" });
    }
  });

  app.post("/api/products/set-position", async (req, res) => {
    try {
      const schema = z.object({
        productId: z.number(),
        position: z.number().min(1)
      });

      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const { productId, position } = validation.data;
      const products = await storage.setProductPosition(productId, position);
      res.json(products);
    } catch (error) {
      console.error("Failed to set product position:", error);
      res.status(500).json({ error: "Failed to set product position" });
    }
  });

  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const [reviews, stats] = await Promise.all([
        storage.getReviews(productId),
        storage.getReviewStats(productId),
      ]);
      res.json({ reviews, stats });
    } catch (error) {
      console.error("Failed to get reviews:", error);
      res.status(500).json({ error: "Failed to get reviews" });
    }
  });

  app.post("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const validation = insertReviewSchema.safeParse({ ...req.body, productId });
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const review = await storage.createReview(validation.data);
      res.json(review);
    } catch (error) {
      console.error("Failed to create review:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  app.delete("/api/reviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteReview(id);
      if (!deleted) {
        return res.status(404).json({ error: "Review not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete review:", error);
      res.status(500).json({ error: "Failed to delete review" });
    }
  });

  app.get("/api/price-filters", async (req, res) => {
    try {
      const filters = await storage.getPriceFilters();
      res.json(filters);
    } catch (error) {
      console.error("Failed to get price filters:", error);
      res.status(500).json({ error: "Failed to get price filters" });
    }
  });

  app.post("/api/price-filters", async (req, res) => {
    try {
      const validation = insertPriceFilterSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const filter = await storage.createPriceFilter(validation.data);
      res.json(filter);
    } catch (error) {
      console.error("Failed to create price filter:", error);
      res.status(500).json({ error: "Failed to create price filter" });
    }
  });

  app.patch("/api/price-filters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = insertPriceFilterSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const filter = await storage.updatePriceFilter(id, validation.data.value);
      if (!filter) {
        return res.status(404).json({ error: "Price filter not found" });
      }
      res.json(filter);
    } catch (error) {
      console.error("Failed to update price filter:", error);
      res.status(500).json({ error: "Failed to update price filter" });
    }
  });

  app.delete("/api/price-filters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePriceFilter(id);
      if (!deleted) {
        return res.status(404).json({ error: "Price filter not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete price filter:", error);
      res.status(500).json({ error: "Failed to delete price filter" });
    }
  });

  app.get("/api/promotional-settings", async (req, res) => {
    try {
      const settings = await storage.getPromotionalSettings();
      res.json(settings);
    } catch (error) {
      console.error("Failed to get promotional settings:", error);
      res.status(500).json({ error: "Failed to get promotional settings" });
    }
  });

  app.patch("/api/promotional-settings", async (req, res) => {
    try {
      const validation = insertPromotionalSettingsSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const { bannerText, timerSeconds, deliveryText } = validation.data;
      const settings = await storage.updatePromotionalSettings(bannerText, timerSeconds, deliveryText);
      res.json(settings);
    } catch (error) {
      console.error("Failed to update promotional settings:", error);
      res.status(500).json({ error: "Failed to update promotional settings" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validation = insertOrderSchema.safeParse(req.body);
      if (!validation.success) {
        console.error("Order validation failed:", validation.error);
        return res.status(400).json({ error: validation.error });
      }

      const order = await storage.createOrder(validation.data);
      
      try {
        await sendOrderToTelegram(order);
      } catch (telegramError) {
        console.error("Failed to send order to Telegram:", telegramError);
      }
      
      res.json(order);
    } catch (error) {
      console.error("Failed to create order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.get("/api/flash-offer", async (req, res) => {
    try {
      const flashOffer = await storage.getFlashOffer();
      res.json(flashOffer);
    } catch (error) {
      console.error("Failed to get flash offer:", error);
      res.status(500).json({ error: "Failed to get flash offer" });
    }
  });

  app.post("/api/flash-offer/start", async (req, res) => {
    try {
      const { maxClaims, durationSeconds, bannerText } = req.body;
      const flashOffer = await storage.startFlashOffer(maxClaims, durationSeconds, bannerText);
      res.json(flashOffer);
    } catch (error) {
      console.error("Failed to start flash offer:", error);
      res.status(500).json({ error: "Failed to start flash offer" });
    }
  });

  app.post("/api/flash-offer/stop", async (req, res) => {
    try {
      const flashOffer = await storage.stopFlashOffer();
      res.json(flashOffer);
    } catch (error) {
      console.error("Failed to stop flash offer:", error);
      res.status(500).json({ error: "Failed to stop flash offer" });
    }
  });

  app.post("/api/flash-offer/claim", async (req, res) => {
    try {
      const result = await storage.claimFlashOffer();
      res.json(result);
    } catch (error) {
      console.error("Failed to claim flash offer:", error);
      res.status(500).json({ error: "Failed to claim flash offer" });
    }
  });

  app.get("/api/delivery-addresses", async (req, res) => {
    try {
      const addresses = await storage.getDeliveryAddresses();
      res.json(addresses);
    } catch (error) {
      console.error("Failed to get delivery addresses:", error);
      res.status(500).json({ error: "Failed to get delivery addresses" });
    }
  });

  app.post("/api/delivery-addresses", async (req, res) => {
    try {
      const validation = insertDeliveryAddressSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const address = await storage.createDeliveryAddress(validation.data);
      res.json(address);
    } catch (error) {
      console.error("Failed to create delivery address:", error);
      res.status(500).json({ error: "Failed to create delivery address" });
    }
  });

  app.patch("/api/delivery-addresses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = insertDeliveryAddressSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error });
      }

      const address = await storage.updateDeliveryAddress(id, validation.data.name);
      if (!address) {
        return res.status(404).json({ error: "Delivery address not found" });
      }
      res.json(address);
    } catch (error) {
      console.error("Failed to update delivery address:", error);
      res.status(500).json({ error: "Failed to update delivery address" });
    }
  });

  app.delete("/api/delivery-addresses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDeliveryAddress(id);
      if (!deleted) {
        return res.status(404).json({ error: "Delivery address not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete delivery address:", error);
      res.status(500).json({ error: "Failed to delete delivery address" });
    }
  });

  app.get("/api/time-challenge", async (req, res) => {
    try {
      const challenge = await storage.getTimeChallenge();
      res.json(challenge);
    } catch (error) {
      console.error("Failed to get time challenge:", error);
      res.status(500).json({ error: "Failed to get time challenge" });
    }
  });

  app.patch("/api/time-challenge", async (req, res) => {
    try {
      const { name, isActive, durationSeconds, discountPercent } = req.body;
      const challenge = await storage.updateTimeChallenge({ name, isActive, durationSeconds, discountPercent });
      res.json(challenge);
    } catch (error) {
      console.error("Failed to update time challenge:", error);
      res.status(500).json({ error: "Failed to update time challenge" });
    }
  });

  app.get("/api/checkout-discount", async (req, res) => {
    try {
      const discount = await storage.getCheckoutDiscount();
      res.json(discount);
    } catch (error) {
      console.error("Failed to get checkout discount:", error);
      res.status(500).json({ error: "Failed to get checkout discount" });
    }
  });

  app.patch("/api/checkout-discount", async (req, res) => {
    try {
      const { discountPercent } = req.body;
      if (typeof discountPercent !== 'number' || discountPercent < 0 || discountPercent > 100) {
        return res.status(400).json({ error: "Discount percent must be a number between 0 and 100" });
      }
      const discount = await storage.updateCheckoutDiscount(discountPercent);
      res.json(discount);
    } catch (error) {
      console.error("Failed to update checkout discount:", error);
      res.status(500).json({ error: "Failed to update checkout discount" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
