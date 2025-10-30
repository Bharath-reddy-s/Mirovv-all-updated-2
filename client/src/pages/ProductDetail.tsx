import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { getProductById } from "@shared/schema";
import { ArrowLeft, Share2, ShoppingCart, Zap, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function ProductDetailPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { addToCart } = useCart();
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();
  
  const productId = parseInt(params.id as string);
  const product = getProductById(productId);

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
            className="flex flex-col gap-6"
          >
            <Card className="bg-black rounded-3xl p-12 flex items-center justify-center min-h-[500px]">
              <div className="relative w-full max-w-md h-[400px]">
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                  <div className="absolute top-full left-0 w-full h-[150px] overflow-hidden opacity-30">
                    <img
                      src={product.image}
                      alt=""
                      className="w-full h-full object-contain scale-y-[-1]"
                      style={{
                        maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)",
                        WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
            
            {product.additionalImages && product.additionalImages.length > 0 && (
              <Card className="bg-black rounded-3xl p-12 flex items-center justify-center min-h-[400px]">
                <div className="relative w-full max-w-md h-[350px]">
                  <img
                    src={product.additionalImages[0]}
                    alt="Product feature"
                    className="w-full h-full object-contain"
                  />
                </div>
              </Card>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col"
          >
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium rounded-full mb-3">
                {product.label}
              </span>
              <h1 className="text-5xl font-bold mb-4 text-black dark:text-white">
                {product.title}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                {product.description}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-black dark:text-white">
                  {product.price}
                </span>
                <span className="text-lg text-gray-500 dark:text-gray-400">
                  starting from
                </span>
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              <Button
                onClick={handleBuyNow}
                size="lg"
                className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-full h-14 text-lg font-semibold gap-2"
                data-testid="button-buy-now"
              >
                <Zap className="w-5 h-5" />
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
              <Button
                onClick={handleShare}
                size="lg"
                variant="outline"
                className="rounded-full h-14 w-14 p-0 border-2"
                disabled={isSharing}
                data-testid="button-share"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            <Card className="p-6 mb-6 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xl font-bold text-black dark:text-white">
                  What's in the Box?
                </h3>
              </div>
              <ul className="space-y-2">
                {product.whatsInTheBox.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-purple-600 dark:text-purple-400 font-bold flex-shrink-0">
                      •
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <div className="p-6 bg-gray-50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-black dark:text-white">
                Specifications
              </h3>
              <div className="space-y-3">
                {product.specifications.map((spec, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-neutral-800 last:border-0">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      {spec.label}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">
                      {spec.value}
                    </span>
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
