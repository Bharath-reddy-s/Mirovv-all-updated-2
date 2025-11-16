import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { getProductById } from "@shared/schema";
import { ArrowLeft, Share2, ShoppingCart, Zap, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function ProductDetailPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { addToCart } = useCart();
  const [isSharing, setIsSharing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const productId = parseInt(params.id as string);
  const product = getProductById(productId);
  
  const allImages = product 
    ? [product.image, ...(product.additionalImages || [])]
    : [];
  
  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };
  
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => setLocation("/shop")}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      label: product.label,
      price: product.price,
      image: product.image,
    });
  };

  const handleBuyNow = () => {
    addToCart({
      id: product.id,
      title: product.title,
      label: product.label,
      price: product.price,
      image: product.image,
    });
    setTimeout(() => {
      setLocation("/checkout");
    }, 500);
  };

  const handleShare = async () => {
    setIsSharing(true);
    const shareData = {
      title: product.title,
      text: `Check out this ${product.title}! ${product.description}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({ title: "Shared successfully!" });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link copied to clipboard!" });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link copied to clipboard!" });
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => setLocation("/shop")}
            className="gap-2"
            data-testid="button-back-to-shop"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            <Card className="bg-black rounded-3xl p-12 flex items-center justify-center min-h-[500px] relative">
              <div className="relative w-full max-w-md h-[400px]">
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={allImages[currentImageIndex]}
                    alt={product.title}
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                  {currentImageIndex === 0 && (
                    <div className="absolute top-full left-0 w-full h-[150px] overflow-hidden opacity-30">
                      <img
                        src={allImages[currentImageIndex]}
                        alt=""
                        className="w-full h-full object-contain scale-y-[-1]"
                        style={{
                          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)",
                          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Previous image"
                    data-testid="button-previous-image"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Next image"
                    data-testid="button-next-image"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                  
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {allImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex 
                            ? 'bg-white w-6' 
                            : 'bg-white/40 hover:bg-white/60'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                        data-testid={`button-image-indicator-${index}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col"
          >
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="inline-block px-3 py-1 bg-gray-200 text-black text-sm font-medium rounded-full">
                  {product.label}
                </span>
                {product.id === 3 ? (
                  <span className="inline-block px-3 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 text-sm font-medium rounded-full" data-testid="text-stock-not-available">
                    Stock not Available
                  </span>
                ) : product.id <= 2 && (
                  <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 text-sm font-medium rounded-full" data-testid="text-stock-available">
                    Stock Available
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-semibold mb-4 text-black dark:text-white">
                {product.title}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                {product.description.split("'GET A GIVEAWAY TICKET TO WIN BOAT NIRVANA ION'").map((part, index, array) => (
                  index < array.length - 1 ? (
                    <>
                      {part}
                      <span className="text-black dark:text-white font-semibold">'GET A GIVEAWAY TICKET TO WIN BOAT NIRVANA ION'</span>
                    </>
                  ) : part
                ))}
              </p>
              {product.id !== 4 && (
                <div className="flex items-baseline gap-3 flex-wrap">
                  <motion.span 
                    className="text-3xl font-bold text-black dark:text-white"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {product.price}
                  </motion.span>
                  {product.originalPrice && (
                    <>
                      <motion.span 
                        className="text-xl text-gray-400 dark:text-gray-500 relative"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        {product.originalPrice}
                        <motion.span
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.6, delay: 0.9 }}
                        >
                          <span className="w-full h-0.5 bg-gray-400 dark:bg-gray-500" />
                        </motion.span>
                      </motion.span>
                      {product.pricingText && (
                        <motion.span
                          className="text-sm text-black dark:text-white"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 1.1 }}
                        >
                          {product.pricingText}
                        </motion.span>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {product.id !== 4 && product.productLink && (
              <div className="mb-6">
                <Button
                  onClick={() => window.open(product.productLink, '_blank', 'noopener,noreferrer')}
                  variant="outline"
                  className="rounded-full"
                  data-testid="button-product-link"
                >
                  View Product
                </Button>
              </div>
            )}

            {product.id !== 4 && (
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex gap-4 flex-1">
                  <Button
                    onClick={handleBuyNow}
                    size="lg"
                    className="flex-1 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-full h-14 text-lg font-semibold border-2 border-gray-200 dark:border-gray-800"
                    data-testid="button-buy-now"
                  >
                    Buy Now
                  </Button>
                  <Button
                    onClick={handleAddToCart}
                    size="lg"
                    variant="outline"
                    className="flex-1 rounded-full h-14 text-lg font-semibold gap-2 border-2"
                    data-testid="button-add-to-cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </Button>
                </div>
                <Button
                  onClick={handleShare}
                  size="lg"
                  variant="outline"
                  className="rounded-full h-14 w-full sm:w-14 p-0 border-2"
                  disabled={isSharing}
                  data-testid="button-share"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="sm:hidden ml-2">Share</span>
                </Button>
              </div>
            )}

            <div className="p-6 mb-6 bg-gray-50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-black dark:text-white">
                Description
              </h3>
              <div className="space-y-3">
                <div className="flex items-start py-2">
                  <span className="text-gray-900 dark:text-gray-100">{product.longDescription}</span>
                </div>
              </div>
            </div>

            <div className="p-6 mb-6 bg-gray-50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-black dark:text-white">
                What's in the Box?
              </h3>
              <div className="space-y-3">
                {product.whatsInTheBox.map((item, index) => (
                  <div key={index} className="flex items-start py-2 border-b border-gray-200 dark:border-neutral-800 last:border-0">
                    <span className="text-gray-600 dark:text-gray-400 font-medium flex-shrink-0 mr-2">
                      •
                    </span>
                    <span className="text-gray-900 dark:text-gray-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
