import { useState, useEffect } from "react";
import { useDeveloper } from "@/contexts/DeveloperContext";
import { Zap } from "lucide-react";

export default function OfferBanner() {
  const { promotionalSettings, flashOffer } = useDeveloper();
  const [timeLeft, setTimeLeft] = useState({ hours: "00", minutes: "00", seconds: "00" });
  const [flashTimeLeft, setFlashTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!promotionalSettings?.timerEndTime) {
      setIsExpired(true);
      return;
    }

    const endTime = new Date(promotionalSettings.timerEndTime).getTime();

    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = endTime - now;

      if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)));
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        setTimeLeft({
          hours: String(hours).padStart(2, "0"),
          minutes: String(minutes).padStart(2, "0"),
          seconds: String(seconds).padStart(2, "0")
        });
        setIsExpired(false);
      } else {
        setTimeLeft({
          hours: "00",
          minutes: "00",
          seconds: "00"
        });
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [promotionalSettings?.timerEndTime]);

  useEffect(() => {
    if (!flashOffer?.isActive || !flashOffer?.endsAt) {
      setFlashTimeLeft(0);
      return;
    }

    const calculateFlashTimeLeft = () => {
      const now = Date.now();
      const endTime = new Date(flashOffer.endsAt!).getTime();
      const difference = Math.max(0, Math.floor((endTime - now) / 1000));
      setFlashTimeLeft(difference);
    };

    calculateFlashTimeLeft();
    const timer = setInterval(calculateFlashTimeLeft, 100);

    return () => clearInterval(timer);
  }, [flashOffer?.isActive, flashOffer?.endsAt]);

  if (flashOffer?.isActive && flashTimeLeft > 0) {
    const spotsRemaining = flashOffer.maxClaims - flashOffer.claimedCount;
    
    return (
      <div
        className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-black py-4 px-4 flex flex-col items-center justify-center gap-2"
        data-testid="banner-flash-offer"
      >
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 fill-black" />
            <span className="text-xl md:text-2xl font-bold" data-testid="text-flash-offer-title">
              {flashOffer.bannerText || "First 5 orders are FREE!"}
            </span>
            <Zap className="h-6 w-6 fill-black" />
          </div>
          <span className="text-xs font-light text-black/70">For products upto ₹200</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-black/10 rounded-lg px-4 py-2">
            <span className="text-sm md:text-base font-medium">Time Left:</span>
            <span className="font-mono text-2xl md:text-3xl font-bold tabular-nums" data-testid="text-flash-timer">
              {flashTimeLeft}s
            </span>
          </div>
          <div className="flex items-center gap-2 bg-black/10 rounded-lg px-4 py-2">
            <span className="text-sm md:text-base font-medium">Spots Left:</span>
            <span className="font-mono text-2xl md:text-3xl font-bold tabular-nums" data-testid="text-flash-spots">
              {spotsRemaining}/{flashOffer.maxClaims}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return null;
  }

  return (
    <div
      className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-black py-4 px-4 flex flex-col items-center justify-center gap-2 pt-[15px] pb-[15px]"
      data-testid="banner-offer"
    >
      <span className="text-lg md:text-xl font-semibold" data-testid="text-offer-title">
        {promotionalSettings?.bannerText || "₹10 off on every product"}
      </span>
      <div className="flex items-center gap-1 font-mono text-xl md:text-2xl font-bold tabular-nums" data-testid="container-timer">
        <span data-testid="text-hours">{timeLeft.hours}</span>
        <span>:</span>
        <span data-testid="text-minutes">{timeLeft.minutes}</span>
        <span>:</span>
        <span data-testid="text-seconds">{timeLeft.seconds}</span>
      </div>
    </div>
  );
}
