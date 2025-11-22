import { useState, useEffect } from "react";
import { useDeveloper } from "@/contexts/DeveloperContext";

export default function OfferBanner() {
  const { promotionalSettings } = useDeveloper();
  const [timeLeft, setTimeLeft] = useState({ hours: "00", minutes: "00", seconds: "00" });

  useEffect(() => {
    if (!promotionalSettings?.timerEndTime) {
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
      } else {
        setTimeLeft({
          hours: "00",
          minutes: "00",
          seconds: "00"
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [promotionalSettings?.timerEndTime]);

  return (
    <div
      className="fixed top-16 left-0 right-0 z-40 w-full bg-black text-white py-4 px-4 flex flex-col items-center justify-center gap-2"
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
