import { motion } from "framer-motion";
import clockImage from "@assets/Screenshot_2025-12-07_at_5.56.49_PM_1765111881674.png";
import timerImage from "@assets/Screenshot_2025-12-07_at_5.57.18_PM_1765111881674.png";
import orderSummaryImage from "@assets/Screenshot_2025-12-07_at_5.58.35_PM_1765111881674.png";

function CurvedArrow() {
  return (
    <svg 
      width="60" 
      height="24" 
      viewBox="0 0 60 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <path 
        d="M2 18C2 18 20 6 30 6C40 6 58 18 58 18" 
        stroke="#9ca3af" 
        strokeWidth="1.5" 
        strokeLinecap="round"
        fill="none"
      />
      <path 
        d="M52 14L58 18L52 22" 
        stroke="#9ca3af" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

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
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-black dark:text-white" data-testid="text-offers-title">
            Special Offers
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto" data-testid="text-offers-description">
            Check out all our amazing offers and save big on your purchases!
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-neutral-900 rounded-[2rem] border-2 border-emerald-500 p-6 md:p-8"
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
              
              <CurvedArrow />
              
              <img 
                src={timerImage} 
                alt="Timer 0:24" 
                className="w-20 h-20 md:w-24 md:h-24 object-contain"
              />
              
              <CurvedArrow />
              
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
