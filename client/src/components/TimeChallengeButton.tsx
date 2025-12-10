import { useState, useEffect } from "react";
import { useTimeChallenge } from "@/contexts/TimeChallengeContext";
import { useCart } from "@/contexts/CartContext";
import { Timer, X, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function TimeChallengeButton() {
  const {
    isChallengeActive,
    challengeStarted,
    challengeExpired,
    timeRemaining,
    discountPercent,
    startChallenge,
    challengeSettings,
  } = useTimeChallenge();
  const { clearCart } = useCart();

  const [isMounted, setIsMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isChallengeActive) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <div
      className="fixed bottom-20 left-4 z-50"
      data-testid="time-challenge-button"
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="collapsed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={toggleExpanded}
            className="w-14 h-14 rounded-full bg-black dark:bg-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            type="button"
          >
            {challengeStarted && !challengeExpired ? (
              <span className="text-white dark:text-black font-bold text-sm" data-testid="text-challenge-timer-collapsed">
                {formatTime(timeRemaining)}
              </span>
            ) : (
              <Timer className="w-6 h-6 text-white dark:text-black" />
            )}
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ scale: 0.8, opacity: 0, width: 56 }}
            animate={{ scale: 1, opacity: 1, width: "auto" }}
            exit={{ scale: 0.8, opacity: 0, width: 56 }}
            className="bg-black dark:bg-white rounded-2xl p-4 shadow-lg min-w-[200px]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-white dark:text-black font-bold text-sm">
                {challengeSettings?.name || "Time is Money"}
              </span>
              <button
                onClick={toggleExpanded}
                className="text-white/70 dark:text-black/70 hover:text-white dark:hover:text-black p-1"
                type="button"
                data-testid="button-close-challenge"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!challengeStarted && !challengeExpired && (
              <div className="text-center">
                <p className="text-white/80 dark:text-black/80 text-xs mb-3">
                  Complete checkout in {challengeSettings?.durationSeconds || 30}s for {challengeSettings?.discountPercent || 30}% off!
                </p>
                <button
                  onClick={() => {
                    clearCart();
                    startChallenge();
                  }}
                  className="w-full hover:bg-green-600 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-[#000000] bg-[#fcfcfc]"
                  type="button"
                  data-testid="button-start-challenge"
                >
                  <Play className="w-4 h-4" />
                  Start
                </button>
              </div>
            )}

            {challengeStarted && !challengeExpired && (
              <div className="text-center">
                <div className="text-3xl font-bold text-white dark:text-black mb-2" data-testid="text-challenge-timer">
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-green-400 dark:text-green-600 text-sm font-medium">
                  {discountPercent}% discount active!
                </p>
                <p className="text-white/60 dark:text-black/60 text-xs mt-1">
                  Complete checkout now
                </p>
              </div>
            )}

            {challengeExpired && (
              <div className="text-center">
                <p className="text-red-400 dark:text-red-600 text-sm font-medium mb-2">
                  Time's up!
                </p>
                <button
                  onClick={startChallenge}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  type="button"
                  data-testid="button-retry-challenge"
                >
                  <Play className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
