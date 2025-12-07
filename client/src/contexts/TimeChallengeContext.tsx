import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { TimeChallenge } from "@shared/schema";

interface TimeChallengeContextType {
  challengeSettings: TimeChallenge | null;
  isChallengeActive: boolean;
  timeRemaining: number;
  challengeStarted: boolean;
  challengeExpired: boolean;
  challengeCompleted: boolean;
  discountPercent: number;
  startChallenge: () => void;
  resetChallenge: () => void;
  markChallengeCompleted: () => void;
}

const TimeChallengeContext = createContext<TimeChallengeContextType | undefined>(undefined);

export function TimeChallengeProvider({ children }: { children: ReactNode }) {
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [challengeExpired, setChallengeExpired] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const { data: challengeSettings = null } = useQuery<TimeChallenge | null>({
    queryKey: ["/api/time-challenge"],
    refetchInterval: 5000,
  });

  const isChallengeActive = challengeSettings?.isActive ?? false;
  const durationSeconds = challengeSettings?.durationSeconds ?? 30;
  const discountPercent = (challengeStarted && !challengeExpired && !challengeCompleted) 
    ? (challengeSettings?.discountPercent ?? 30) 
    : 0;

  useEffect(() => {
    if (!challengeStarted || challengeExpired || challengeCompleted || !startTime) {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, durationSeconds - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        setChallengeExpired(true);
        setChallengeStarted(false);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [challengeStarted, challengeExpired, challengeCompleted, startTime, durationSeconds]);

  const startChallenge = useCallback(() => {
    if (!isChallengeActive) return;
    
    setChallengeStarted(true);
    setChallengeExpired(false);
    setChallengeCompleted(false);
    setStartTime(Date.now());
    setTimeRemaining(durationSeconds);
  }, [isChallengeActive, durationSeconds]);

  const resetChallenge = useCallback(() => {
    setChallengeStarted(false);
    setChallengeExpired(false);
    setChallengeCompleted(false);
    setStartTime(null);
    setTimeRemaining(0);
  }, []);

  const markChallengeCompleted = useCallback(() => {
    setChallengeCompleted(true);
    setChallengeStarted(false);
  }, []);

  return (
    <TimeChallengeContext.Provider
      value={{
        challengeSettings,
        isChallengeActive,
        timeRemaining,
        challengeStarted,
        challengeExpired,
        challengeCompleted,
        discountPercent,
        startChallenge,
        resetChallenge,
        markChallengeCompleted,
      }}
    >
      {children}
    </TimeChallengeContext.Provider>
  );
}

export function useTimeChallenge() {
  const context = useContext(TimeChallengeContext);
  if (!context) {
    throw new Error("useTimeChallenge must be used within TimeChallengeProvider");
  }
  return context;
}
