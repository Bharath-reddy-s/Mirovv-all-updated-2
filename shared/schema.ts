import { z } from "zod";

export interface Product {
  id: number;
  title: string;
  label: string;
  price: string;
  originalPrice?: string;
  pricingText?: string;
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
  productLink?: string;
}

export interface StockStatus {
  [productId: number]: boolean;
}

export const updateStockStatusSchema = z.object({
  productId: z.number(),
  isInStock: z.boolean(),
});

export type UpdateStockStatus = z.infer<typeof updateStockStatusSchema>;

export const products: Product[] = [
  {
    id: 1,
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
    ]
  },
  {
    id: 2,
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
    ]
  },
  {
    id: 3,
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
    ]
  },
  {
    id: 4,
    title: "Future Giveaways",
    label: "Giveaway Ticket Included",
    price: "₹99",
    originalPrice: "₹149",
    pricingText: "( Unlock Future Surprises )",
    image: "/image_1763301124744.png",
    additionalImages: ["/image_1763301139652.png", "/image_1763301155394.png"],
    description: "THIS The Giveaways of Future",
    longDescription: "Mystery box is the medium through which we want to give stuff to students (dont expect that stuff guys) . this is for the people who always say \"Thu yak adru college ge band no\" or \"for that one guy whole is always lonely \" or for that one friend who is single  forever and that one friend who looks inocent but only you know about him . Enjoy the experience very time From the moment you order to the thrill of unboxing and even winning a giveaway, every step is designed to make life a little less \"ugh\" and a lot more \"SIKE\"",
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
    ]
  }
];

export function getProductById(id: number): Product | undefined {
  return products.find(product => product.id === id);
}
