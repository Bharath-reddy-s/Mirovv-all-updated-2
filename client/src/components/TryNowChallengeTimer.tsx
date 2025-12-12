import { useTryNowChallenge } from "@/contexts/TryNowChallengeContext";
import { Timer, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function TryNowChallengeTimer() {
  const { isTryNowActive, timeRemaining, challengeType, discountPercent } = useTryNowChallenge();

  if (!isTryNowActive) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        className="fixed bottom-20 right-4 z-50"
        data-testid="try-now-challenge-timer"
      >
        <div className={`rounded-2xl p-4 shadow-lg min-w-[180px] ${
          challengeType === "timer" 
            ? "bg-black dark:bg-white" 
            : "bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500"
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {challengeType === "timer" ? (
              <Timer className="w-5 h-5 text-white dark:text-black" />
            ) : (
              <Zap className="w-5 h-5 text-black" />
            )}
            <span className={`font-bold text-sm ${
              challengeType === "timer" ? "text-white dark:text-black" : "text-black"
            }`}>
              {challengeType === "timer" ? "Timer Challenge" : "Flash Challenge"}
            </span>
          </div>
          <div className={`text-3xl font-bold text-center mb-1 ${
            challengeType === "timer" ? "text-white dark:text-black" : "text-black"
          }`} data-testid="text-try-now-timer">
            {formatTime(timeRemaining)}
          </div>
          <p className={`text-xs text-center ${
            challengeType === "timer" 
              ? "text-green-400 dark:text-green-600" 
              : "text-black/80"
          }`}>
            {discountPercent}% discount active!
          </p>
          <p className={`text-xs text-center mt-1 ${
            challengeType === "timer" 
              ? "text-white/60 dark:text-black/60" 
              : "text-black/60"
          }`}>
            Complete checkout now
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
