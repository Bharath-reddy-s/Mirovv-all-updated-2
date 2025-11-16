import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { products } from "@shared/schema";
import { Link } from "wouter";
import { useState, useEffect } from "react";

export default function ShopPage() {
  const { addToCart } = useCart();
  const [currentImageIndices, setCurrentImageIndices] = useState<{[key: number]: number}>({});

  useEffect(() => {
    const intervals: {[key: number]: NodeJS.Timeout} = {};
    
    products.forEach((product) => {
      const allImages = [product.image, ...(product.additionalImages || [])];
      if (allImages.length > 1) {
        intervals[product.id] = setInterval(() => {
          setCurrentImageIndices((prev) => ({
            ...prev,
            [product.id]: ((prev[product.id] || 0) + 1) % allImages.length,
          }));
        }, 5000);
      }
    });

    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-3 text-black dark:text-white">
            Explore Mystery Boxes
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Spreading happiness through our Giveaway and Mystery box
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
          {products.map((box, index) => (
            <motion.div
              key={box.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -8 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-black rounded-[24px] overflow-hidden flex flex-col"
              data-testid={`card-product-${box.id}`}
            >
              <Link href={`/shop/${box.id}`}>
                <div className="p-6 pb-0 flex flex-col flex-1 cursor-pointer transition-opacity">
                  <h2 className="text-white text-[22px] font-bold mb-2 leading-tight">
                    {box.title}
                  </h2>
                  
                  {box.id !== 4 && (
                    <p className="text-white/70 text-sm font-normal mb-1">
                      Giveaway Ticket Included
                    </p>
                  )}
                  
                  {box.id !== 4 && (
                    <p className="text-white/70 text-sm font-normal mb-4">
                      At {box.price}
                    </p>
                  )}
                  
                  <div className={`relative w-full flex-1 flex items-center justify-center min-h-[300px] mb-4 overflow-hidden ${box.id === 4 ? 'mt-4' : ''}`}>
                    <AnimatePresence mode="wait">
                      {(() => {
                        const allImages = [box.image, ...(box.additionalImages || [])];
                        const currentIndex = currentImageIndices[box.id] || 0;
                        const currentImage = allImages[currentIndex];
                        
                        return (
                          <motion.img
                            key={`${box.id}-${currentIndex}`}
                            src={currentImage}
                            alt={box.title}
                            className="w-full h-full object-contain drop-shadow-2xl absolute"
                            initial={{ x: "100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "-100%", opacity: 0 }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                          />
                        );
                      })()}
                    </AnimatePresence>
                  </div>
                </div>
              </Link>
              
              <div className="px-6 pb-6">
                <Button
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart(box);
                  }}
                  className="w-full bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white rounded-xl h-12 text-sm font-medium"
                  data-testid={`button-add-to-cart-${box.id}`}
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
