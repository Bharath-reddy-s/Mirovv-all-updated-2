import { z } from "zod";

export interface Product {
  id: number;
  title: string;
  label: string;
  price: string;
  image: string;
  additionalImages?: string[];
  description: string;
  longDescription: string;
  features: string[];
  whatsInTheBox: string[];
  specifications: {
    label: string;
    value: string;
  }[];
}

export const products: Product[] = [
  {
    id: 1,
    title: "Lightts",
    label: "Giveaway Ticket Included",
    price: "₹59",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/ChatGPT-Image-Oct-25-2025-02_30_59-AM-1761678796762.png?width=8000&height=8000&resize=contain",
    additionalImages: ["/earbuds-product.png"],
    description: "Get a Mystery box and 'GET A GIVEAWAY TICKET TO WIN BOAT NIRVANA ION' at a cost of 3.5 LIGHTS",
    longDescription: "The Digital Mystery Box is your gateway to exclusive digital content and premium software. Each box contains carefully curated digital products worth significantly more than the purchase price. From productivity tools to entertainment subscriptions, you'll discover amazing digital treasures that enhance your online experience.",
    features: [
      "5+ Premium Digital Products",
      "Exclusive Software Licenses",
      "Digital Content Access",
      "Instant Delivery",
      "Money-Back Guarantee"
    ],
    whatsInTheBox: [
      "Premium Software License (up to ₹5,000 value)",
      "Digital Course Access (3 months)",
      "E-Book Collection (5+ titles)",
      "Stock Photo Subscription",
      "Digital Wallpaper Pack",
      "Exclusive Digital Stickers"
    ],
    specifications: [
      { label: "Delivery", value: "Instant Digital Download" },
      { label: "Value", value: "Up to ₹8,000" },
      { label: "Items", value: "5-8 Digital Products" },
      { label: "Validity", value: "Lifetime Access" }
    ]
  },
  {
    id: 2,
    title: "Tech Box",
    label: "Giveaway Ticket Included",
    price: "₹499",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/ChatGPT-Image-Oct-25-2025-02_30_59-AM-1761678796762.png?width=8000&height=8000&resize=contain",
    description: "Experience cutting-edge technology with gadgets, accessories, and tech essentials in every box.",
    longDescription: "The Tech Mystery Box delivers the latest in technology and gadget innovation straight to your doorstep. Perfect for tech enthusiasts and gadget lovers, each box contains a carefully selected collection of tech accessories, smart devices, and innovative gadgets that make your digital life easier and more exciting.",
    features: [
      "3-5 Tech Gadgets",
      "Premium Quality Accessories",
      "Latest Technology",
      "Surprise Brand Items",
      "100% Satisfaction Guaranteed"
    ],
    whatsInTheBox: [
      "Wireless Earbuds or Headphones",
      "Phone Accessories (Cable, Case, or Stand)",
      "Smart LED Light Strip",
      "Portable Power Bank (10,000mAh)",
      "USB Hub or Tech Organizer",
      "Mystery Premium Tech Item"
    ],
    specifications: [
      { label: "Delivery", value: "3-5 Business Days" },
      { label: "Value", value: "Up to ₹3,500" },
      { label: "Items", value: "3-5 Tech Products" },
      { label: "Warranty", value: "Manufacturer Warranty" }
    ]
  },
  {
    id: 3,
    title: "Concert Box",
    label: "Giveaway Ticket Included",
    price: "₹999",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/ChatGPT-Image-Oct-25-2025-02_30_59-AM-1761678796762.png?width=8000&height=8000&resize=contain",
    description: "Get exclusive concert merchandise, VIP experiences, and music-related surprises.",
    longDescription: "The Concert Mystery Box is the ultimate package for music lovers and concert enthusiasts. Each box includes exclusive merchandise, limited edition items, and potential access to amazing music experiences. From artist collaborations to VIP concert tickets, you never know what incredible surprise awaits inside.",
    features: [
      "Official Band Merchandise",
      "Limited Edition Collectibles",
      "Concert Experience Opportunities",
      "Exclusive Music Content",
      "VIP Access Chances"
    ],
    whatsInTheBox: [
      "Official Band T-Shirt or Hoodie",
      "Limited Edition Poster (signed)",
      "Concert Ticket Voucher (select events)",
      "Exclusive Vinyl Record or CD",
      "VIP Meet & Greet Pass (lucky winners)",
      "Festival Accessories Pack",
      "Mystery Artist Collaboration Item"
    ],
    specifications: [
      { label: "Delivery", value: "5-7 Business Days" },
      { label: "Value", value: "Up to ₹10,000" },
      { label: "Items", value: "5-7 Music Products" },
      { label: "Authenticity", value: "100% Official Merchandise" }
    ]
  }
];

export function getProductById(id: number): Product | undefined {
  return products.find(product => product.id === id);
}
