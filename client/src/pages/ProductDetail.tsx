import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Navbar from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { useDeveloper } from "@/contexts/DeveloperContext";
import { type Product, type Review, insertReviewSchema } from "@shared/schema";
import { ArrowLeft, Share2, ShoppingCart, Zap, Package, ChevronLeft, ChevronRight, Star, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { z } from "zod";

const reviewFormSchema = insertReviewSchema.omit({ productId: true });
type ReviewFormData = z.infer<typeof reviewFormSchema>;

export default function ProductDetailPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { addToCart } = useCart();
  const { stockStatus } = useDeveloper();
  const [isSharing, setIsSharing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [showReviews, setShowReviews] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const productId = parseInt(params.id as string);
  
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error("Product not found");
      return response.json();
    },
  });

  const { data: reviewData, isLoading: reviewsLoading } = useQuery<{
    reviews: Review[];
    stats: { averageRating: number; totalReviews: number };
  }>({
    queryKey: ["/api/products", productId, "reviews"],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/reviews`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      return response.json();
    },
  });

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 1,
      reviewText: "",
      reviewerName: "",
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      return apiRequest("POST", `/api/products/${productId}/reviews`, { ...data, productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "reviews"] });
      form.reset();
      setSelectedRating(0);
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to submit review",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = (data: ReviewFormData) => {
    if (selectedRating === 0) {
      toast({
        title: "Please select a rating",
        description: "Click on the stars to rate this product.",
        variant: "destructive",
      });
      return;
    }
    form.setValue("rating", selectedRating);
    reviewMutation.mutate({ ...data, rating: selectedRating });
  };
  
  const isInStock = stockStatus[productId] ?? true;
  
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-16 text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

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
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        reviewData?.stats && star <= Math.round(reviewData.stats.averageRating)
                          ? 'fill-black text-black dark:fill-white dark:text-white'
                          : 'fill-none text-black dark:text-white'
                      }`}
                      data-testid={`star-${star}`}
                    />
                  ))}
                </div>
                {reviewData?.stats && reviewData.stats.totalReviews > 0 && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {reviewData.stats.totalReviews} {reviewData.stats.totalReviews === 1 ? 'review' : 'reviews'}
                  </span>
                )}
                {product.id <= 3 && (
                  <span 
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                      isInStock
                        ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400"
                    }`}
                    data-testid={isInStock ? "text-stock-available" : "text-stock-not-available"}
                  >
                    {isInStock ? "Stock Available" : "Stock not Available"}
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
                    </>
                  )}
                </div>
              )}
            </div>

            {product.id !== 4 && isInStock && (
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

            {product.id !== 4 && !isInStock && (
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  onClick={handleShare}
                  size="lg"
                  variant="outline"
                  className="rounded-full h-14 w-full border-2"
                  disabled={isSharing}
                  data-testid="button-share"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="ml-2">Share</span>
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
                Customer Reviews
              </h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmitReview)} className="space-y-4 mb-6">
                  <div>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Rating</FormLabel>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setSelectedRating(star)}
                          className="focus:outline-none"
                          data-testid={`button-rating-${star}`}
                        >
                          <Star
                            className={`w-6 h-6 cursor-pointer transition-colors ${
                              star <= selectedRating
                                ? 'fill-black text-black dark:fill-white dark:text-white'
                                : 'fill-none text-black dark:text-white hover:fill-gray-400 hover:text-gray-400'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="reviewText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Review</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share your experience with this product..."
                            className="min-h-[100px]"
                            data-testid="input-review-text"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reviewerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your name"
                            data-testid="input-reviewer-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={reviewMutation.isPending}
                    className="w-full bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    data-testid="button-submit-review"
                  >
                    {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              </Form>

              <div className="border-t border-gray-200 dark:border-neutral-800 pt-6">
                <div 
                  className="flex items-center justify-between mb-4 cursor-pointer hover-elevate active-elevate-2 p-2 -m-2 rounded-md"
                  onClick={() => setShowReviews(!showReviews)}
                  data-testid="button-toggle-reviews"
                >
                  <h4 className="text-lg font-semibold text-black dark:text-white">
                    All Reviews
                  </h4>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${
                      showReviews ? 'rotate-0' : '-rotate-90'
                    }`}
                    data-testid="icon-reviews-toggle"
                  />
                </div>
                {showReviews && (reviewsLoading ? (
                  <p className="text-gray-600 dark:text-gray-400" data-testid="text-loading-reviews">Loading reviews...</p>
                ) : reviewData?.reviews && reviewData.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviewData.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700"
                        data-testid={`review-${review.id}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? 'fill-black text-black dark:fill-white dark:text-white'
                                    : 'fill-none text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          {review.reviewerName && (
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {review.reviewerName}
                            </span>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{review.reviewText}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400" data-testid="text-no-reviews">
                    No reviews yet. Be the first to review this product!
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
