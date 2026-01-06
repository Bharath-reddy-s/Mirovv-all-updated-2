import { z } from "zod";
import { pgTable, serial, text, boolean, jsonb, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  productCode: text("product_code"),
  title: text("title").notNull(),
  label: text("label").notNull(),
  price: text("price").notNull(),
  originalPrice: text("original_price"),
  pricingText: text("pricing_text"),
  image: text("image").notNull(),
  additionalImages: text("additional_images").array(),
  description: text("description").notNull(),
  longDescription: text("long_description").notNull(),
  features: text("features").array(),
  whatsInTheBox: text("whats_in_the_box").array().notNull(),
  specifications: jsonb("specifications").$type<{ label: string; value: string; }[]>(),
  productLink: text("product_link"),
  isInStock: boolean("is_in_stock").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
});

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  rating: integer("rating").notNull(),
  reviewerName: text("reviewer_name"),
  reviewText: text("review_text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const priceFiltersTable = pgTable("price_filters", {
  id: serial("id").primaryKey(),
  value: integer("value").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

export const promotionalSettingsTable = pgTable("promotional_settings", {
  id: serial("id").primaryKey(),
  bannerText: text("banner_text").notNull().default("₹10 off on every product"),
  timerSeconds: integer("timer_seconds").notNull().default(604800),
  timerEndTime: timestamp("timer_end_time"),
  deliveryText: text("delivery_text").notNull().default("Shop for ₹199 and get free delivery"),
});

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  mobile: text("mobile").notNull(),
  address: text("address").notNull(),
  instagram: text("instagram").notNull(),
  items: jsonb("items").$type<{ productId: number; productCode: string; title: string; price: string; quantity: number; image: string }[]>().notNull(),
  total: text("total").notNull(),
  isFlashOffer: boolean("is_flash_offer").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const flashOffersTable = pgTable("flash_offers", {
  id: serial("id").primaryKey(),
  isActive: boolean("is_active").notNull().default(false),
  maxClaims: integer("max_claims").notNull().default(5),
  claimedCount: integer("claimed_count").notNull().default(0),
  durationSeconds: integer("duration_seconds").notNull().default(30),
  startedAt: timestamp("started_at"),
  endsAt: timestamp("ends_at"),
  bannerText: text("banner_text").notNull().default("First 5 orders are FREE!"),
});

export const checkoutDiscountTable = pgTable("checkout_discount", {
  id: serial("id").primaryKey(),
  discountPercent: integer("discount_percent").notNull().default(0),
});

export const deliveryAddressesTable = pgTable("delivery_addresses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

export const timeChallengeTable = pgTable("time_challenge", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Time is Money"),
  isActive: boolean("is_active").notNull().default(false),
  durationSeconds: integer("duration_seconds").notNull().default(30),
  discountPercent: integer("discount_percent").notNull().default(30),
});

export const offersTable = pgTable("offers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  images: text("images").array().notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

export const shopPopupTable = pgTable("shop_popup", {
  id: serial("id").primaryKey(),
  isHomeActive: boolean("is_home_active").notNull().default(false),
  isShopActive: boolean("is_shop_active").notNull().default(false),
  imageUrl: text("image_url"),
  homeImageUrl: text("home_image_url"),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, isInStock: true, displayOrder: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, createdAt: true }).extend({
  rating: z.number().min(1).max(5),
  reviewText: z.string().min(10, "Review must be at least 10 characters"),
  reviewerName: z.string().optional(),
});
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;

export const insertPriceFilterSchema = createInsertSchema(priceFiltersTable).omit({ id: true, displayOrder: true }).extend({
  value: z.number().positive("Price filter value must be positive"),
});
export type InsertPriceFilter = z.infer<typeof insertPriceFilterSchema>;
export type PriceFilter = typeof priceFiltersTable.$inferSelect;

export const insertPromotionalSettingsSchema = createInsertSchema(promotionalSettingsTable).omit({ id: true }).extend({
  bannerText: z.string().min(1, "Banner text is required"),
  timerSeconds: z.number().min(1, "Timer must be at least 1 second").max(31536000, "Timer cannot exceed 1 year"),
  timerEndTime: z.date().optional(),
  deliveryText: z.string().min(1, "Delivery text is required"),
});
export type InsertPromotionalSettings = z.infer<typeof insertPromotionalSettingsSchema>;
export type PromotionalSettings = typeof promotionalSettingsTable.$inferSelect;

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, orderNumber: true, createdAt: true, isFlashOffer: true }).extend({
  customerName: z.string().min(1, "Customer name is required"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  instagram: z.string().min(1, "Instagram username is required"),
  total: z.string().min(1, "Total is required"),
  isFlashOffer: z.boolean().optional(),
});
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;

export type FlashOffer = typeof flashOffersTable.$inferSelect;

export const insertDeliveryAddressSchema = createInsertSchema(deliveryAddressesTable).omit({ id: true, displayOrder: true }).extend({
  name: z.string().min(1, "Address name is required"),
});
export type InsertDeliveryAddress = z.infer<typeof insertDeliveryAddressSchema>;
export type DeliveryAddress = typeof deliveryAddressesTable.$inferSelect;

export type TimeChallenge = typeof timeChallengeTable.$inferSelect;

export type CheckoutDiscount = typeof checkoutDiscountTable.$inferSelect;

export type ShopPopup = typeof shopPopupTable.$inferSelect;

export const insertOfferSchema = createInsertSchema(offersTable).omit({ id: true, displayOrder: true }).extend({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
});
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offersTable.$inferSelect;

export const updateOfferSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  images: z.array(z.string()).optional(),
});
export type UpdateOffer = z.infer<typeof updateOfferSchema>;

export interface StockStatus {
  [productId: number]: boolean;
}

export const updateStockStatusSchema = z.object({
  productId: z.number(),
  isInStock: z.boolean(),
});

export type UpdateStockStatus = z.infer<typeof updateStockStatusSchema>;

export const createProductSchema = z.object({
  productCode: z.string().min(1),
  title: z.string().min(1),
  label: z.string().min(1),
  price: z.string().min(1),
  originalPrice: z.string().optional(),
  pricingText: z.string().optional(),
  image: z.string().url(),
  additionalImages: z.array(z.string().url()).optional(),
  description: z.string().min(1),
  longDescription: z.string().min(1),
  features: z.array(z.string()).optional(),
  whatsInTheBox: z.array(z.string()),
  specifications: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).optional(),
  productLink: z.string().url().optional(),
});

export const updateProductSchema = z.object({
  id: z.number(),
  productCode: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  label: z.string().min(1).optional(),
  price: z.string().min(1).optional(),
  originalPrice: z.string().optional(),
  pricingText: z.string().optional(),
  image: z.string().url().optional(),
  additionalImages: z.array(z.string().url()).optional(),
  description: z.string().min(1).optional(),
  longDescription: z.string().min(1).optional(),
  features: z.array(z.string()).optional(),
  whatsInTheBox: z.array(z.string()).optional(),
  specifications: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).optional(),
  productLink: z.string().url().optional(),
});

export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;

export const products: Product[] = [
  {
    id: 1,
    productCode: "#101",
    title: "Lightts",
    label: "Giveaway Ticket Included",
    price: "₹49",
    originalPrice: "₹79",
    pricingText: "( Just at a price of 3 Lights )",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/ChatGPT-Image-Oct-25-2025-02_30_59-AM-1761678796762.png?width=8000&height=8000&resize=contain",
    additionalImages: ["/earbuds-product.png"],
    description: "Had a breakup? or feeling lonely this can fix it all Listening, Paro in Nirvana Ion with a Hot Chai and a Lights . Get a chance to win Boat Nirvana Ion by ordering Lightts Mystery box.",
    longDescription: "Mystery box is the medium through which we want to give stuff to students (dont expect that stuff guys) . this is for the people who always say \"Thu yak adru college ge band no\" or \"for that one guy whole is always lonely \" or for that one friend who is single  forever and that one friend who looks inocent but only you know about him . Enjoy the experience very time From the moment you order to the thrill of unboxing and even winning a giveaway, every step is designed to make life a little less \"ugh\" and a lot more \"SIKE\"",
    productLink: "https://www.boat-lifestyle.com/products/nirvana-ion-bluetooth-wireless-earbuds?variant=40281089048674&country=IN&currency=INR&gad_source=1&gad_campaignid=21766993129&gbraid=0AAAAADCnhlzGBYwBhrtiFFKoGiOszNPst&gclid=Cj0KCQiAiebIBhDmARIsAE8PGNKctZTVKdhYF4Cqi2uX0K5xAkVZdReEkiZmPwGu_Gk8ihgf8VmkVI4aAj0jEALw_wcB",
    features: [
      "5+ Premium Digital Products",
      "Exclusive Software Licenses",
      "Digital Content Access",
      "Instant Delivery",
      "Money-Back Guarantee"
    ],
    whatsInTheBox: [
      "A Mystery item (something you would not expect)",
      "A Letter (guide to use the product)",
      "GIVEAWAY TICKET (Its all about This)",
      "GIVEAWAY products are not sent in mystery box"
    ],
    specifications: [
      { label: "Delivery", value: "Instant Digital Download" },
      { label: "Value", value: "Up to ₹8,000" },
      { label: "Items", value: "5-8 Digital Products" },
      { label: "Validity", value: "Lifetime Access" }
    ],
    isInStock: true,
    isFeatured: false,
    displayOrder: 1
  },
  {
    id: 2,
    productCode: "#102",
    title: "Aahhh!!!!",
    label: "Giveaway Ticket Included",
    price: "₹69",
    originalPrice: "₹139",
    pricingText: "( Satisfaction for the price of an ice cream )",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/ChatGPT-Image-Oct-25-2025-02_30_59-AM-1761678796762.png?width=8000&height=8000&resize=contain",
    additionalImages: ["/2in1-tongue-massager-flicking-vibrating_1763055138772.webp"],
    description: "Experience the Aahhh!!! every time you use it . Do you miss him or she missed your _______ ? . Get a chance to win this giveaway by ordering Aahhh!!! Mystery box today.",
    longDescription: "Mystery box is the medium through which we want to give stuff to students (dont expect that stuff guys) . this is for the people who always say \"Thu yak adru college ge band no\" or \"for that one guy whole is always lonely \" or for that one friend who is single  forever and that one friend who looks inocent but only you know about him . Enjoy the experience very time From the moment you order to the thrill of unboxing and even winning a giveaway, every step is designed to make life a little less \"ugh\" and a lot more \"SIKE\"",
    productLink: "https://thatsassything.com/collections/bestsellers-icon-homepage/products/tickle-tongue-massager",
    features: [
      "3-5 Tech Gadgets",
      "Premium Quality Accessories",
      "Latest Technology",
      "Surprise Brand Items",
      "100% Satisfaction Guaranteed"
    ],
    whatsInTheBox: [
      "A Mystery item (something you would not expect)",
      "A Letter (guide to use the product)",
      "GIVEAWAY TICKET (Its all about This)",
      "GIVEAWAY products are not sent in mystery box"
    ],
    specifications: [
      { label: "Delivery", value: "3-5 Business Days" },
      { label: "Value", value: "Up to ₹3,500" },
      { label: "Items", value: "3-5 Tech Products" },
      { label: "Warranty", value: "Manufacturer Warranty" }
    ],
    isInStock: true,
    isFeatured: false,
    displayOrder: 2
  },
  {
    id: 3,
    productCode: "#103",
    title: "Rider PRO MAX",
    label: "Giveaway Ticket Included",
    price: "₹79",
    originalPrice: "₹159",
    pricingText: "( Chance to win Stylish Helmet at a price of a Cheese maggi )",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/ChatGPT-Image-Oct-25-2025-02_30_59-AM-1761678796762.png?width=8000&height=8000&resize=contain",
    additionalImages: ["/image_1763056963689.png"],
    description: "You are a Rider pro max but without a good Helmet? Ufff . Get A chance to win this AXOR Helmet by ordering The Rider Mystery box today.",
    longDescription: "Mystery box is the medium through which we want to give stuff to students (dont expect that stuff guys) . this is for the people who always say \"Thu yak adru college ge band no\" or \"for that one guy whole is always lonely \" or for that one friend who is single  forever and that one friend who looks inocent but only you know about him . Enjoy the experience very time From the moment you order to the thrill of unboxing and even winning a giveaway, every step is designed to make life a little less \"ugh\" and a lot more \"SIKE\"",
    productLink: "https://axorhelmets.com/collections/full-face-helmets/products/hunter-turbo-helmet?variant=44572874342532",
    features: [
      "Official Band Merchandise",
      "Limited Edition Collectibles",
      "Concert Experience Opportunities",
      "Exclusive Music Content",
      "VIP Access Chances"
    ],
    whatsInTheBox: [
      "A Mystery item (something you would not expect)",
      "A Letter (guide to use the product)",
      "GIVEAWAY TICKET (Its all about This)",
      "GIVEAWAY products are not sent in mystery box"
    ],
    specifications: [
      { label: "Delivery", value: "5-7 Business Days" },
      { label: "Value", value: "Up to ₹10,000" },
      { label: "Items", value: "5-7 Music Products" },
      { label: "Authenticity", value: "100% Official Merchandise" }
    ],
    isInStock: true,
    isFeatured: false,
    displayOrder: 3
  },
  {
    id: 4,
    productCode: "#104",
    title: "Future Giveaways",
    label: "Giveaway Ticket Included",
    price: "₹99",
    originalPrice: "₹149",
    pricingText: "( Unlock Future Surprises )",
    image: "/image_1763301124744.png",
    additionalImages: ["/image_1763301139652.png", "/image_1763301155394.png"],
    description: "THIS The Giveaways of Future",
    longDescription: "Mystery box is the medium through which we want to give stuff to students (dont expect that stuff guys) . this is for the people who always say \"Thu yak adru college ge band no\" or \"for that one guy whole is always lonely \" or for that one friend who is single  forever and that one friend who looks inocent but only you know about him . Enjoy the experience very time From the moment you order to the thrill of unboxing and even winning a giveaway, every step is designed to make life a little less \"ugh\" and a lot more \"SIKE\"",
    productLink: null,
    features: [
      "Early Access to New Giveaways",
      "Exclusive Future Products",
      "Priority Notifications",
      "Special Member Benefits",
      "Surprise Bonus Items"
    ],
    whatsInTheBox: [
      "A Mystery item (something you would not expect)",
      "A Letter (guide to use the product)",
      "GIVEAWAY TICKET (Its all about This)",
      "GIVEAWAY products are not sent in mystery box"
    ],
    specifications: [
      { label: "Delivery", value: "Instant Digital Access" },
      { label: "Value", value: "Up to ₹5,000" },
      { label: "Items", value: "Varies by Season" },
      { label: "Updates", value: "Monthly New Giveaways" }
    ],
    isInStock: true,
    isFeatured: false,
    displayOrder: 4
  }
];

export function getProductById(id: number): Product | undefined {
  return products.find(product => product.id === id);
}
