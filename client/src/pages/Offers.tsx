import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Play, Timer, Zap } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useTryNowChallenge } from "@/contexts/TryNowChallengeContext";
import type { Offer, TimeChallenge } from "@shared/schema";
import { formatBoldText } from "@/lib/formatText";

export default function OffersPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { startTryNowChallenge, isTryNowActive } = useTryNowChallenge();

  const { data: offers = [], isLoading } = useQuery<Offer[]>({
    queryKey: ["/api/offers"],
  });

  const { data: timeChallenge } = useQuery<TimeChallenge | null>({
    queryKey: ["/api/time-challenge"],
  });

  const handleTryNow = (offerTitle: string) => {
    if (isTryNowActive) return;
    
    if (offerTitle.toLowerCase().includes("timer")) {
      const duration = timeChallenge?.durationSeconds || 30;
      const discount = timeChallenge?.discountPercent || 30;
      startTryNowChallenge("timer", duration, discount);
    } else if (offerTitle.toLowerCase().includes("flash")) {
      startTryNowChallenge("flash", 30, 100);
    }
    setLocation("/shop");
  };

  const shouldShowTryNow = (title: string) => {
    const lowerTitle = title.toLowerCase();
    return lowerTitle.includes("timer") || lowerTitle.includes("flash");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <main className="container mx-auto px-4 pt-32 pb-16 text-[33px] text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-[33px] md:text-6xl mb-6 font-semibold whitespace-nowrap max-[380px]:text-[22px] text-black dark:text-white" data-testid="text-offers-title">See How To Lootify Us!!</h1>
        </motion.div>

        <div className="max-w-5xl mx-auto space-y-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading offers...</div>
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400">No offers available at the moment.</p>
            </div>
          ) : (
            offers.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`rounded-[2rem] border-2 border-black dark:border-white p-6 md:p-8 font-medium ${
                  index === 1 
                    ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500" 
                    : "dark:bg-neutral-900 bg-[#a3ada326]"
                }`}
                data-testid={`card-offer-${offer.id}`}
              >
                <p className={`text-sm md:text-base leading-relaxed text-center mb-8 ${
                  index === 1 ? "text-black" : "text-black dark:text-white"
                }`}>
                  <span className="font-bold">{index + 1}. {formatBoldText(offer.title)}</span> - {formatBoldText(offer.description)}
                </p>

                {offer.images.length > 0 && (
                  <div className="flex items-center justify-center gap-1 md:gap-2 flex-nowrap">
                    {offer.images.map((image, imgIndex) => (
                      <div key={imgIndex} className="flex items-center">
                        <img 
                          src={image} 
                          alt={`${offer.title} image ${imgIndex + 1}`}
                          className="w-20 h-20 md:w-24 md:h-24 object-contain cursor-pointer hover:opacity-80 transition-opacity rounded-lg"
                          onClick={() => setSelectedImage(image)}
                          data-testid={`img-offer-${offer.id}-${imgIndex}`}
                        />
                        {imgIndex < offer.images.length - 1 && (
                          <ArrowRight className="w-8 h-8 text-gray-500 dark:text-gray-400 flex-shrink-0 mx-1" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {shouldShowTryNow(offer.title) && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      onClick={() => handleTryNow(offer.title)}
                      disabled={isTryNowActive}
                      className={`font-bold px-8 py-3 rounded-full gap-2 ${
                        offer.title.toLowerCase().includes("timer")
                          ? "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                          : "bg-black text-white hover:bg-gray-800"
                      }`}
                      data-testid={`button-try-now-${offer.id}`}
                    >
                      {offer.title.toLowerCase().includes("timer") ? (
                        <Timer className="w-5 h-5" />
                      ) : (
                        <Zap className="w-5 h-5" />
                      )}
                      <Play className="w-4 h-4" />
                      Try Now
                    </Button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-3xl p-2 bg-transparent border-none">
            {selectedImage && (
              <img 
                src={selectedImage} 
                alt="Full size view" 
                className="w-full h-auto rounded-lg"
                data-testid="img-fullsize"
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
