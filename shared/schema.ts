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
    longDescription: "Mystery box is the medium through which we want to give stuff to students (dont expect that stuff guys) . this is for the people who always say \"Thu yak adru college ge band no\" or \"for that one guy whole is always lonely \" or for that one friend who is single  forever and that one friend who looks inocent but only you know about him . Enjoy the experience very time From the moment you order to the thrill of unboxing and even winning a giveaway, every step is designed to make life a little less \"ugh\" and a lot more \"SIKE\"",
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
    ]
  },
  {
    id: 2,
    title: "Tech Box",
    label: "Giveaway Ticket Included",
    price: "₹499",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/ChatGPT-Image-Oct-25-2025-02_30_59-AM-1761678796762.png?width=8000&height=8000&resize=contain",
    additionalImages: ["/2in1-tongue-massager-flicking-vibrating_1763055138772.webp"],
    description: "Experience cutting-edge technology with gadgets, accessories, and tech essentials in every box.",
    longDescription: "Mystery box is the medium through which we want to give stuff to students (dont expect that stuff guys) . this is for the people who always say \"Thu yak adru college ge band no\" or \"for that one guy whole is always lonely \" or for that one friend who is single  forever and that one friend who looks inocent but only you know about him . Enjoy the experience very time From the moment you order to the thrill of unboxing and even winning a giveaway, every step is designed to make life a little less \"ugh\" and a lot more \"SIKE\"",
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
    ]
  },
  {
    id: 3,
    title: "Concert Box",
    label: "Giveaway Ticket Included",
    price: "₹999",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/ChatGPT-Image-Oct-25-2025-02_30_59-AM-1761678796762.png?width=8000&height=8000&resize=contain",
    additionalImages: ["/image_1763056306183.png"],
    description: "Get exclusive concert merchandise, VIP experiences, and music-related surprises.",
    longDescription: "Mystery box is the medium through which we want to give stuff to students (dont expect that stuff guys) . this is for the people who always say \"Thu yak adru college ge band no\" or \"for that one guy whole is always lonely \" or for that one friend who is single  forever and that one friend who looks inocent but only you know about him . Enjoy the experience very time From the moment you order to the thrill of unboxing and even winning a giveaway, every step is designed to make life a little less \"ugh\" and a lot more \"SIKE\"",
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
    ]
  }
];

export function getProductById(id: number): Product | undefined {
  return products.find(product => product.id === id);
}
