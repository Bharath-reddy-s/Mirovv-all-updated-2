import { useEffect, useState } from "react";
import BackgroundPaths from "@/components/BackgroundPaths";
import OfferBanner from "@/components/OfferBanner";
import { Card } from "@/components/ui/card";
import { HelpCircle, Shield, Eye, Truck, Sparkles, Instagram, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

const aboutPoints = [
  {
    icon: HelpCircle,
    title: "Why do we exist?",
    description: "Most of you have used Flipkart or Amazon. You've probably seen products that are clearly overpriced compared to what they should cost. That happens because sellers on those platforms pay platform fees—usually 5% to 25%—and they increase the product price to cover it. We remove that entire commission layer, so you get the same products at a far more reasonable and honest price."
  },
  {
    icon: Shield,
    title: "Our Promise",
    description: "If you find the same product on Amazon or Flipkart for less, we don't just match it—we beat it. Show us the price, we match it instantly, and then slash an additional 5% off the matched price. No excuses, no games. Just the guaranteed lowest price, every time."
  },
  {
    icon: Eye,
    title: "Vision",
    description: "We're constantly hunting for real wholesalers across India to source genuine products at the lowest possible prices. No middlemen, no inflated margins—just direct sourcing so you save on every single order and never get ripped off by overpriced marketplaces. We'll keep tracking down better products and negotiating even better prices, so you always get maximum value."
  },
  {
    icon: Truck,
    title: "Delivery & Return Policy",
    description: "Your order will arrive in 7–10 days. The reason is simple—we source products directly from wholesalers across different regions of India, not from inflated middlemen warehouses. That takes a little longer, but it's what lets us give you the lowest prices. Faster delivery is already in the works, and we'll roll it out as soon as it's ready."
  },
  {
    icon: Sparkles,
    title: "What you can expect from us",
    description: "A constantly evolving product lineup with frequent new arrivals, including selected imported items sourced from trusted suppliers. No fake listings, no hidden tricks—just genuine products at the best possible prices by cutting out middlemen. Plus, fun challenges that unlock maximum discounts and exclusive offers, so every purchase gives you more value."
  }
];

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);
  const { data: shopPopup } = useQuery<{ id: number; isHomeActive: boolean; isShopActive: boolean; imageUrl: string | null; homeImageUrl: string | null }>({
    queryKey: ["/api/shop-popup"],
    staleTime: 60000,
  });

  useEffect(() => {
    if (shopPopup?.isHomeActive && shopPopup?.homeImageUrl) {
      const hasSeenPopup = sessionStorage.getItem("homePopupSeen");
      if (!hasSeenPopup) {
        setShowPopup(true);
        // We only set it to seen AFTER it has been closed, not immediately when it shows
      }
    }
  }, [shopPopup]);

  const handleClosePopup = () => {
    setShowPopup(false);
    sessionStorage.setItem("homePopupSeen", "true");
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, []);

  return (
    <div className="pt-16">
      <OfferBanner />
      <BackgroundPaths title="Mirovv Welcomes You" />
      
      <section 
        id="about-us" 
        className="min-h-screen bg-background py-20 px-4"
      >
        <div className="container mx-auto max-w-4xl">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-center mb-6 text-black dark:text-white" 
            data-testid="heading-about-us"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            About Us
          </motion.h2>
          <motion.p 
            className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            We're on a mission to bring you honest pricing and genuine products, cutting out the middlemen.
          </motion.p>
          
          <div className="flex flex-col gap-6">
            {aboutPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * (index + 3) }}
              >
                <Card className="p-6 md:p-8 shadow-sm" data-testid={`card-about-${index}`} id={point.title === "Delivery & Return Policy" ? "delivery-return-policy" : undefined}>
                  <div className="flex items-center gap-3 mb-3">
                    <point.icon className="w-6 h-6 text-foreground" strokeWidth={1.5} />
                    <h3 className="text-lg md:text-xl font-semibold text-foreground">
                      {point.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {point.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="mt-12 flex flex-col items-center gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 * (aboutPoints.length + 3) }}
          >
            <div className="flex flex-wrap justify-center gap-6">
              <a 
                href="https://www.instagram.com/mirovv.in?igsh=MXFhOWtrMnpvbjZnbg==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform group"
                data-testid="link-social-instagram"
              >
                <Instagram className="w-8 h-8 text-black" />
              </a>
              <a 
                href="mailto:contact@mirovv.in" 
                className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform group"
                data-testid="link-social-email"
              >
                <Mail className="w-8 h-8 text-black" />
              </a>
            </div>

            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
              asChild
              data-testid="button-instagram-link"
            >
              <a 
                href="https://www.instagram.com/mirovv.in?igsh=MXFhOWtrMnpvbjZnbg==" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Instagram className="w-5 h-5" />
                Follow us on Instagram
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {showPopup && shopPopup?.homeImageUrl && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={handleClosePopup}
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
                onClick={handleClosePopup}
                className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all hover:scale-110 active:scale-95"
                data-testid="button-close-popup"
              >
                <X className="w-5 h-5 text-black dark:text-white" />
              </button>
              <img
                src={shopPopup.homeImageUrl}
                alt="Welcome popup"
                className="w-full h-auto rounded-[32px] shadow-2xl border-4 border-white/10"
                data-testid="img-popup"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
