import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";

interface OfferCardProps {
  number: number;
  title: string;
  description: string;
  steps: {
    icon?: "clock" | "timer" | "result";
    content?: string;
    image?: string;
  }[];
}

function OfferCard({ number, title, description, steps }: OfferCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: number * 0.1 }}
      className="relative bg-white dark:bg-neutral-900 rounded-2xl border-2 border-emerald-500 p-6 md:p-8 shadow-lg"
    >
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-black dark:text-white mb-4">
          {number}.{title}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 py-6">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-4 md:gap-6">
            {step.icon === "clock" && (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-black dark:bg-neutral-800 flex items-center justify-center shadow-lg border-4 border-gray-200 dark:border-gray-700">
                <Clock className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
            )}
            
            {step.icon === "timer" && (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-black dark:bg-neutral-800 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl md:text-3xl font-bold">{step.content}</span>
              </div>
            )}
            
            {step.icon === "result" && step.image && (
              <div className="w-32 h-48 md:w-40 md:h-56 rounded-xl overflow-hidden shadow-lg border-2 border-gray-200 dark:border-gray-700">
                <img 
                  src={step.image} 
                  alt="Result preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {step.icon === "result" && !step.image && (
              <div className="w-32 h-48 md:w-40 md:h-56 rounded-xl bg-gray-100 dark:bg-neutral-800 shadow-lg border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded mb-2">
                    30% Discount Active!
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Order Summary</p>
                  <div className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹4</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span>₹39</span>
                    </div>
                    <div className="flex justify-between text-emerald-500">
                      <span>Discount</span>
                      <span>-₹1</span>
                    </div>
                    <div className="flex justify-between font-bold text-black dark:text-white pt-1 border-t border-gray-200 dark:border-gray-600">
                      <span>Total</span>
                      <span>₹42</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {index < steps.length - 1 && (
              <ArrowRight className="w-6 h-6 md:w-8 md:h-8 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function OffersPage() {
  const offers: OfferCardProps[] = [
    {
      number: 1,
      title: "Timer Challenge",
      description: "Timer challenge is a challenge where there is a clock which appears on the screen when you click start on that you will see a Timer of XXXX seconds at that time whatever products you buy will be at a XY discounted price",
      steps: [
        { icon: "clock" },
        { icon: "timer", content: "0:24" },
        { icon: "result" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <main className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-black dark:text-white">
            Special Offers
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Check out all our amazing offers and save big on your purchases!
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          {offers.map((offer) => (
            <OfferCard key={offer.number} {...offer} />
          ))}
        </div>
      </main>
    </div>
  );
}
