import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { useDeveloper } from "@/contexts/DeveloperContext";
import { useTryNowChallenge } from "@/contexts/TryNowChallengeContext";
import { type Product, type PriceFilter, type TimeChallenge } from "@shared/schema";
import { Link } from "wouter";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortOption = "default" | "low-to-high" | "high-to-low" | "random";

export default function ShopPage() {
  const { addToCart } = useCart();
  const { flashOffer } = useDeveloper();
  const { isTryNowActive } = useTryNowChallenge();
  const [currentImageIndices, setCurrentImageIndices] = useState<{[key: number]: number}>({});
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [flashTimeLeft, setFlashTimeLeft] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const [prevPopupActive, setPrevPopupActive] = useState<boolean | null>(null);
  
  const { data: shopPopup } = useQuery<{ id: number; isActive: boolean; imageUrl: string | null; showOn: string }>({
    queryKey: ["/api/shop-popup"],
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (shopPopup?.isActive && shopPopup?.imageUrl && (shopPopup.showOn === 'shop' || shopPopup.showOn === 'both')) {
      const hasSeenPopup = sessionStorage.getItem("shopPopupSeen");
      
      if (!hasSeenPopup) {
        setShowPopup(true);
        sessionStorage.setItem("shopPopupSeen", "true");
      }
    }
  }, [shopPopup]);

  const { data: priceFilters = [], isLoading: isLoadingFilters } = useQuery<PriceFilter[]>({
    queryKey: ["/api/price-filters"],
  });

  const { data: timeChallenge } = useQuery<TimeChallenge>({
    queryKey: ["/api/time-challenge"],
  });

  useEffect(() => {
    if (!flashOffer?.isActive || !flashOffer?.endsAt) {
      setFlashTimeLeft(0);
      return;
    }

    const calculateFlashTimeLeft = () => {
      const now = Date.now();
      const endTime = new Date(flashOffer.endsAt!).getTime();
      const difference = Math.max(0, Math.floor((endTime - now) / 1000));
      setFlashTimeLeft(difference);
    };

    calculateFlashTimeLeft();
    const timer = setInterval(calculateFlashTimeLeft, 100);

    return () => clearInterval(timer);
  }, [flashOffer?.isActive, flashOffer?.endsAt]);

  const isFlashOfferActive = flashOffer?.isActive && flashTimeLeft > 0 && 
    flashOffer.claimedCount < flashOffer.maxClaims;

  const priceFilterOptions = priceFilters.length > 0 
    ? priceFilters.map(filter => filter.value)
    : [9, 29, 49, 79, 99, 149, 199];

  const extractPrice = (priceString: string): number => {
    const match = priceString.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result: Product[];
    
    if (selectedPriceFilter) {
      const filterIndex = priceFilterOptions.indexOf(selectedPriceFilter);
      const minPrice = filterIndex >= 2 ? priceFilterOptions[filterIndex - 2] : 0;
      const maxPrice = selectedPriceFilter;
      
      result = products.filter((product) => {
        const price = extractPrice(product.price);
        return price > minPrice && price <= maxPrice;
      });
    } else {
      result = [...products];
    }
    
    // When time challenge, flash offer, or Try Now challenge is active, force sort by price low-to-high
    if (timeChallenge?.isActive || isFlashOfferActive || isTryNowActive) {
      result = result.sort((a, b) => extractPrice(a.price) - extractPrice(b.price));
    } else if (sortOption === "low-to-high") {
      result = result.sort((a, b) => extractPrice(a.price) - extractPrice(b.price));
    } else if (sortOption === "high-to-low") {
      result = result.sort((a, b) => extractPrice(b.price) - extractPrice(a.price));
    } else if (sortOption === "random") {
      // Fisher-Yates shuffle only for random option
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
    }
    // "default" keeps the server's displayOrder (no sorting applied)
    
    return result;
  }, [products, selectedPriceFilter, sortOption, priceFilterOptions, timeChallenge?.isActive, isFlashOfferActive, isTryNowActive]);

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
  }, [products]);

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
          <h1 className="text-[30px] md:text-6xl whitespace-nowrap font-semibold pt-[0px] pb-[0px] mt-[11px] mb-[11px] text-black dark:text-white">Explore Our Products</h1>
          
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max md:min-w-0 px-4 md:justify-center md:w-full items-center mt-[0px] mb-[0px] pl-[0px] pr-[0px] ml-[30px] mr-[30px]">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="h-10 px-4 flex-shrink-0 rounded-lg flex items-center gap-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-600 text-black dark:text-white text-sm font-medium transition-all hover:bg-gray-50 dark:hover:bg-neutral-700"
                    data-testid="button-sort-toggle"
                  >
                    Sort
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem
                    onClick={() => setSortOption("default")}
                    className="flex items-center justify-between"
                    data-testid="button-sort-default"
                  >
                    Default
                    {sortOption === "default" && <Check className="w-4 h-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortOption("low-to-high")}
                    className="flex items-center justify-between"
                    data-testid="button-sort-low-to-high"
                  >
                    Price: Low to High
                    {sortOption === "low-to-high" && <Check className="w-4 h-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortOption("high-to-low")}
                    className="flex items-center justify-between"
                    data-testid="button-sort-high-to-low"
                  >
                    Price: High to Low
                    {sortOption === "high-to-low" && <Check className="w-4 h-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortOption("random")}
                    className="flex items-center justify-between"
                    data-testid="button-sort-random"
                  >
                    Random
                    {sortOption === "random" && <Check className="w-4 h-4" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
              
              <button
                onClick={() => setSelectedPriceFilter(null)}
                className={`w-14 h-14 flex-shrink-0 rounded-full flex flex-col items-center justify-center text-white font-bold transition-transform hover:scale-105 ${
                  selectedPriceFilter === null ? 'bg-black' : 'bg-gray-300 dark:bg-gray-700'
                }`}
                data-testid="button-filter-all"
              >
                <span className="text-[10px]">All</span>
              </button>
              {priceFilterOptions.map((price) => (
                <button
                  key={price}
                  onClick={() => setSelectedPriceFilter(price)}
                  className={`w-14 h-14 flex-shrink-0 rounded-full flex flex-col items-center justify-center text-white font-bold transition-transform hover:scale-105 ${
                    selectedPriceFilter === price ? 'bg-black' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                  data-testid={`button-filter-${price}`}
                >
                  <span className="text-[9px] font-normal">Under</span>
                  <span className="text-lg font-bold">₹{price}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="text-center text-gray-600 dark:text-gray-400">Loading products...</div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400">No products found in this price range.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
            {filteredAndSortedProducts.map((box, index) => (
            <motion.div
              key={box.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -8 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
              className="bg-black rounded-[24px] overflow-hidden flex flex-col"
              data-testid={`card-product-${box.id}`}
            >
              <Link href={`/shop/${box.id}`}>
                <div className="p-6 pb-0 flex flex-col flex-1 cursor-pointer transition-opacity">
                  <h2 className="text-white text-[22px] font-bold mb-2 leading-tight">
                    {box.title}
                  </h2>
                  
                  
                  {box.id !== 4 && (
                    <p className="text-white/70 text-sm font-normal mb-4">
                      At {box.price}
                    </p>
                  )}
                  
                  <div className={`relative w-full flex-1 flex items-center justify-center min-h-[300px] mb-4 overflow-hidden ${box.id === 4 ? 'mt-4' : ''}`}>
                    {(() => {
                      const allImages = [box.image, ...(box.additionalImages || [])];
                      const currentIndex = currentImageIndices[box.id] || 0;
                      const currentImage = allImages[currentIndex];
                      
                      return (
                        <img
                          src={currentImage}
                          alt={box.title}
                          loading="lazy"
                          className="w-full h-full object-contain drop-shadow-2xl transition-opacity duration-300 rounded-xl"
                        />
                      );
                    })()}
                  </div>
                </div>
              </Link>
              
              {box.id !== 4 && (
                <div className="px-6 pb-6">
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart({
                        id: box.id,
                        productCode: box.productCode || '',
                        title: box.title,
                        label: box.label,
                        price: box.price,
                        image: box.image,
                      });
                    }}
                    className="w-full bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white rounded-xl h-12 text-sm font-medium"
                    data-testid={`button-add-to-cart-${box.id}`}
                  >
                    Add to Cart
                  </Button>
                </div>
              )}
            </motion.div>
            ))}
          </div>
        )}
      </main>

      {showPopup && shopPopup?.imageUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowPopup(false)}
          data-testid="popup-overlay"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[calc(100vw-3rem)] md:max-w-[400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPopup(false)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all hover:scale-110 active:scale-95"
              data-testid="button-close-popup"
            >
              <X className="w-5 h-5 text-black dark:text-white" />
            </button>
            <img
              src={shopPopup.imageUrl}
              alt="Shop popup"
              className="w-full h-auto rounded-[32px] shadow-2xl border-4 border-white/10"
              data-testid="img-popup"
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
