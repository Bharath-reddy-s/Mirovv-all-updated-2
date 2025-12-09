import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { type Product } from "@shared/schema";
import { Link } from "wouter";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState, useEffect } from "react";

interface SimilarProductsProps {
  productId: number;
  limit?: number;
}

export default function SimilarProducts({ productId, limit = 6 }: SimilarProductsProps) {
  const { addToCart } = useCart();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { data: similarProducts = [], isLoading, isError } = useQuery<Product[]>({
    queryKey: ["/api/products", productId, "similar", limit],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/similar?limit=${limit}`);
      if (!response.ok) {
        throw new Error("Failed to fetch similar products");
      }
      return response.json();
    },
    enabled: !!productId && productId > 0,
  });

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [similarProducts]);

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  const parsePrice = (priceStr: string): number => {
    const cleanedValue = priceStr.replace(/[^\d]/g, '');
    return parseInt(cleanedValue, 10) || 0;
  };

  const calculateDiscount = (price: string, originalPrice: string | null): number | null => {
    if (!originalPrice) return null;
    const current = parsePrice(price);
    const original = parsePrice(originalPrice);
    if (original > current) {
      return Math.round(((original - current) / original) * 100);
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="mt-12">
        <h3 className="text-2xl font-bold mb-6 text-black dark:text-white">Similar Products</h3>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="w-[200px] h-[280px] bg-gray-100 dark:bg-neutral-800 rounded-xl animate-pulse flex-shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError || similarProducts.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-12"
    >
      <div className="flex items-center justify-between mb-6 gap-4">
        <h3 className="text-2xl font-bold text-black dark:text-white">Similar Products</h3>
        {canScrollRight && (
          <Button
            variant="outline"
            size="icon"
            onClick={scrollRight}
            className="rounded-full"
            data-testid="button-scroll-similar-products"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={checkScrollability}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {similarProducts.map((product, index) => {
          const discount = calculateDiscount(product.price, product.originalPrice);
          
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex-shrink-0 w-[200px]"
            >
              <Card 
                className="overflow-hidden bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 hover-elevate"
                data-testid={`similar-product-${product.id}`}
              >
                <Link href={`/shop/${product.id}`}>
                  <div className="relative">
                    <div className="aspect-square bg-gray-50 dark:bg-neutral-800 p-4 flex items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.title}
                        loading="lazy"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    {discount && (
                      <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                        {discount}% OFF
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-[40px]">
                      {product.title}
                    </h4>

                    <div className="flex items-baseline gap-2 mt-2 flex-wrap">
                      <span className="text-lg font-bold text-black dark:text-white">
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                {product.id !== 4 && (
                  <div className="px-3 pb-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart({
                          id: product.id,
                          productCode: product.productCode || '',
                          title: product.title,
                          label: product.label,
                          price: product.price,
                          image: product.image,
                        });
                      }}
                      className="w-full text-xs"
                      data-testid={`button-add-to-cart-similar-${product.id}`}
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
