import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

type ChallengeType = "timer" | "flash" | null;
type ChallengeStatus = "idle" | "active" | "completed" | "failed";

interface TryNowChallengeContextType {
  challengeType: ChallengeType;
  challengeStatus: ChallengeStatus;
  timeRemaining: number;
  durationSeconds: number;
  discountPercent: number;
  startTryNowChallenge: (type: "timer" | "flash", duration: number, discount: number) => void;
  completeTryNowChallenge: () => void;
  failTryNowChallenge: () => void;
  resetTryNowChallenge: () => void;
  dismissPopup: () => void;
  isTryNowActive: boolean;
}

const TryNowChallengeContext = createContext<TryNowChallengeContextType | undefined>(undefined);

export function TryNowChallengeProvider({ children }: { children: ReactNode }) {
  const [challengeType, setChallengeType] = useState<ChallengeType>(null);
  const [challengeStatus, setChallengeStatus] = useState<ChallengeStatus>("idle");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const { clearCart } = useCart();
  const { toast } = useToast();

  const isTryNowActive = challengeStatus === "active" && timeRemaining > 0;

  useEffect(() => {
    if (challengeStatus !== "active" || !startTime) {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, durationSeconds - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        setChallengeStatus("failed");
      }
    }, 100);

    return () => clearInterval(interval);
  }, [challengeStatus, startTime, durationSeconds]);

  const startTryNowChallenge = useCallback((type: "timer" | "flash", duration: number, discount: number) => {
    clearCart();
    toast({
      title: "Cart cleared for Try Now Challenge!",
      description: type === "timer" 
        ? `Complete checkout in ${duration}s for ${discount}% off!` 
        : "Complete checkout before time runs out!",
      duration: 3000,
    });
    setChallengeType(type);
    setChallengeStatus("active");
    setDurationSeconds(duration);
    setDiscountPercent(discount);
    setStartTime(Date.now());
    setTimeRemaining(duration);
  }, [clearCart, toast]);

  const completeTryNowChallenge = useCallback(() => {
    if (challengeStatus === "active") {
      setChallengeStatus("completed");
    }
  }, [challengeStatus]);

  const failTryNowChallenge = useCallback(() => {
    setChallengeStatus("failed");
  }, []);

  const resetTryNowChallenge = useCallback(() => {
    setChallengeType(null);
    setChallengeStatus("idle");
    setTimeRemaining(0);
    setDurationSeconds(0);
    setDiscountPercent(0);
    setStartTime(null);
  }, []);

  const dismissPopup = useCallback(() => {
    if (challengeStatus === "completed" || challengeStatus === "failed") {
      resetTryNowChallenge();
    }
  }, [challengeStatus, resetTryNowChallenge]);

  return (
    <TryNowChallengeContext.Provider
      value={{
        challengeType,
        challengeStatus,
        timeRemaining,
        durationSeconds,
        discountPercent,
        startTryNowChallenge,
        completeTryNowChallenge,
        failTryNowChallenge,
        resetTryNowChallenge,
        dismissPopup,
        isTryNowActive,
      }}
    >
      {children}
    </TryNowChallengeContext.Provider>
  );
}

export function useTryNowChallenge() {
  const context = useContext(TryNowChallengeContext);
  if (!context) {
    throw new Error("useTryNowChallenge must be used within TryNowChallengeProvider");
  }
  return context;
}
