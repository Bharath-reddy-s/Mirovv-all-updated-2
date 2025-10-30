import { motion } from "framer-motion";
import { Package, Sparkles, Gift, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function BackgroundPaths({ title }: { title: string }) {
  return (
    <div className="relative min-h-screen bg-white dark:bg-neutral-950 overflow-hidden">
      <div className="absolute inset-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "rgb(168, 85, 247)", stopOpacity: 0.1 }} />
              <stop offset="100%" style={{ stopColor: "rgb(139, 92, 246)", stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <motion.path
            d="M 0,200 Q 250,100 500,200 T 1000,200"
            stroke="url(#grad1)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          <motion.path
            d="M 0,400 Q 250,300 500,400 T 1000,400"
            stroke="url(#grad1)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.2 }}
            transition={{ duration: 2, delay: 0.3, ease: "easeInOut" }}
          />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-black dark:text-white">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12">
            Discover amazing surprises in every mystery box. Premium products, unbeatable value, endless excitement!
          </p>
          <Link href="/shop">
            <Button
              size="lg"
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-full h-14 px-8 text-lg font-semibold gap-2"
              data-testid="button-shop-now"
            >
              <Package className="w-5 h-5" />
              Shop Mystery Boxes
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-24"
        >
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-black dark:text-white">Surprise & Delight</h3>
            <p className="text-gray-600 dark:text-gray-400">Every box is packed with unexpected treasures</p>
          </div>
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
              <Gift className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-black dark:text-white">Premium Value</h3>
            <p className="text-gray-600 dark:text-gray-400">Get products worth more than what you pay</p>
          </div>
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
              <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-black dark:text-white">Fast Delivery</h3>
            <p className="text-gray-600 dark:text-gray-400">Quick shipping to your doorstep</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
