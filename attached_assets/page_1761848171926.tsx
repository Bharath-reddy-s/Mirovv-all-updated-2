"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { products } from "@/data/products";
import Link from "next/link";

export default function ShopPage() {
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12">

          <h1 className="text-6xl font-bold mb-3 text-black dark:text-white">
            Explore Mystery Boxes
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choose your adventure and unlock exclusive surprises
          </p>
        </motion.div>

        {/* Mystery Boxes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1400px] mx-auto">
          {products.map((box, index) => (
            <motion.div
              key={box.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-black rounded-[32px] overflow-hidden flex flex-col"
            >
              <Link href={`/shop/${box.id}`}>
                <div className="p-8 cursor-pointer hover:opacity-90 transition-opacity">
                  {/* Title */}
                  <h2 className="text-white text-[28px] font-bold mb-1 leading-tight">
                    {index + 1}. {box.title}
                  </h2>
                  
                  {/* Label */}
                  <p className="text-gray-400 text-sm mb-3">
                    {box.label}
                  </p>
                  
                  {/* Price */}
                  <p className="text-white text-lg font-normal mb-3">
                    From {box.price}
                  </p>
                  
                  {/* Mystery Box Image */}
                  <div className="relative w-full h-[320px] mb-1 flex items-center justify-center">
                    <div className="relative w-[280px] h-[280px]">
                      <Image
                        src={box.image}
                        alt={box.title}
                        fill
                        className="object-contain drop-shadow-2xl"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </Link>
              
              {/* Add to Cart Button */}
              <div className="px-8 pb-8">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart(box);
                  }}
                  className="w-full bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white rounded-2xl h-14 text-base font-medium transition-colors"
                >
                  Add to Cart
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}