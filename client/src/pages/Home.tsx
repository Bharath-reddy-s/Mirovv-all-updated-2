import BackgroundPaths from "@/components/BackgroundPaths";
import OfferBanner from "@/components/OfferBanner";
import { Card } from "@/components/ui/card";
import { HelpCircle, Shield, Eye, Truck } from "lucide-react";

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
  }
];

export default function Home() {
  return (
    <div className="pt-16">
      <OfferBanner />
      <BackgroundPaths title="Mirovv Welcomes You" />
      
      <section id="about-us" className="min-h-screen bg-background py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-foreground" data-testid="heading-about-us">
            About Us
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            We're on a mission to bring you honest pricing and genuine products, cutting out the middlemen.
          </p>
          
          <div className="flex flex-col gap-6">
            {aboutPoints.map((point, index) => (
              <Card key={index} className="p-6 md:p-8 shadow-sm" data-testid={`card-about-${index}`}>
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
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
