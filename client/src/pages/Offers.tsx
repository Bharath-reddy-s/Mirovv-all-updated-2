import { motion } from "framer-motion";
import { Clock } from "lucide-react";

function HatchedBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-20 h-24 md:w-24 md:h-28 rounded-lg overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: '#ffffff',
          backgroundImage: `repeating-linear-gradient(
            -55deg,
            transparent,
            transparent 3px,
            #d4d4d4 3px,
            #d4d4d4 4px
          )`
        }}
      />
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

function CurvedArrow() {
  return (
    <svg 
      width="40" 
      height="20" 
      viewBox="0 0 40 20" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <path 
        d="M2 10C2 10 12 3 20 3C28 3 38 10 38 10" 
        stroke="#9ca3af" 
        strokeWidth="1.5" 
        strokeLinecap="round"
        fill="none"
      />
      <path 
        d="M32 5L38 10L32 15" 
        stroke="#9ca3af" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function OrderSummaryCard() {
  return (
    <div className="w-44 md:w-52 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="text-sm font-bold text-black dark:text-white p-3 pb-2">
        Order Summary
      </div>
      
      <div className="bg-emerald-500 mx-2 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-1.5 text-white font-bold text-xs">
          <Clock className="w-3.5 h-3.5" />
          30% Discount Active!
        </div>
        <p className="text-white/90 text-[10px] mt-1">Complete checkout now to save ₹1!</p>
        <p className="text-white/70 text-[9px]">Time remaining: 0:18</p>
      </div>
      
      <div className="px-3 pb-2">
        <div className="flex gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 bg-gray-100 dark:bg-neutral-800 rounded border border-gray-200 dark:border-gray-700 flex-shrink-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-medium text-black dark:text-white leading-tight truncate">Double-Sided Waterproof Nano Adhesive Tape (0.6mm, 1pc)</p>
            <p className="text-[8px] text-gray-500 dark:text-gray-400">Giveaway Ticket Included</p>
            <p className="text-[8px] text-gray-500 dark:text-gray-400">Qty: 1</p>
          </div>
          <span className="text-[10px] font-medium text-black dark:text-white flex-shrink-0">₹4</span>
        </div>
      </div>
      
      <div className="px-3 pb-3 space-y-1.5 text-[10px]">
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Subtotal</span>
          <span className="text-black dark:text-white">₹4</span>
        </div>
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Delivery fees</span>
          <span className="text-black dark:text-white">₹39</span>
        </div>
        <div className="flex justify-between text-emerald-500">
          <span className="flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            Time Challenge (30% off)
          </span>
          <span>-₹1</span>
        </div>
        <div className="flex justify-between pt-1.5 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="bg-black dark:bg-neutral-800 text-white text-[9px] font-bold px-2 py-1 rounded-full">
              0:18
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-600 dark:text-gray-400">T</span>
            <span className="font-bold text-black dark:text-white">₹42</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface OfferCardProps {
  number: number;
  title: string;
  description: string;
}

function OfferCard({ number, title, description }: OfferCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: number * 0.1 }}
      className="relative bg-white dark:bg-neutral-900 rounded-3xl border-2 border-emerald-500 p-6 md:p-8"
      data-testid={`card-offer-${number}`}
    >
      <p className="text-sm md:text-base text-black dark:text-white leading-relaxed text-center mb-6">
        <span className="font-bold">{number}.{title}</span>- {description}
      </p>

      <div className="flex items-center justify-center gap-2 md:gap-3">
        <HatchedBackground>
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-black flex items-center justify-center">
            <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={1.5} />
          </div>
        </HatchedBackground>
        
        <CurvedArrow />
        
        <HatchedBackground>
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-black flex items-center justify-center">
            <span className="text-white text-base md:text-lg font-bold">0:24</span>
          </div>
        </HatchedBackground>
        
        <CurvedArrow />
        
        <OrderSummaryCard />
      </div>
    </motion.div>
  );
}

export default function OffersPage() {
  const offers: OfferCardProps[] = [];

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

        <div className="max-w-5xl mx-auto space-y-8">
        </div>
      </main>
    </div>
  );
}
