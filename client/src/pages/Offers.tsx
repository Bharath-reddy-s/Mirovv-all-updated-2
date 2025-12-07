import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import clockImage from "@assets/Screenshot_2025-12-07_at_5.56.49_PM_1765111881674.png";
import timerImage from "@assets/Screenshot_2025-12-07_at_5.57.18_PM_1765111881674.png";
import orderSummaryImage from "@assets/Screenshot_2025-12-07_at_5.58.35_PM_1765111881674.png";

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <main className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="md:text-6xl mb-6 text-black dark:text-white text-[51px] font-semibold" data-testid="text-offers-title">Learn How To Lootify Us!!</h1>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="dark:bg-neutral-900 rounded-[2rem] border-2 border-black dark:border-white p-6 md:p-8 bg-[#a3ada326]"
            data-testid="card-offer-1"
          >
            <p className="text-sm md:text-base text-black dark:text-white leading-relaxed text-center mb-8">
              <span className="font-bold">1.Timmer Challenge</span>- Timmer challenge is a change where there is a clock which appears on the screen when you click start on that you will see a Timmer of XXXX seconds at that time what ever products you buy will be at a XY discounted price
            </p>

            <div className="flex items-center justify-center gap-1 md:gap-2">
              <img 
                src={clockImage} 
                alt="Clock" 
                className="w-20 h-20 md:w-24 md:h-24 object-contain"
              />
              
              <ArrowRight className="w-8 h-8 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              
              <img 
                src={timerImage} 
                alt="Timer 0:24" 
                className="w-20 h-20 md:w-24 md:h-24 object-contain"
              />
              
              <ArrowRight className="w-8 h-8 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              
              <img 
                src={orderSummaryImage} 
                alt="Order Summary" 
                className="w-32 h-auto md:w-44 object-contain rounded-lg"
              />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
