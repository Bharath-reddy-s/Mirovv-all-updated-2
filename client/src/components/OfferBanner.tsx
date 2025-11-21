import { useState, useEffect } from "react";

export default function OfferBanner() {
  const [timeLeft, setTimeLeft] = useState({ hours: "00", minutes: "00", seconds: "00" });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 7);
      targetDate.setHours(23, 59, 59, 0);

      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)));
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        setTimeLeft({
          hours: String(hours).padStart(2, "0"),
          minutes: String(minutes).padStart(2, "0"),
          seconds: String(seconds).padStart(2, "0")
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="fixed top-16 left-0 right-0 z-40 w-full bg-black text-white py-4 px-4 flex flex-col items-center justify-center gap-2"
      data-testid="banner-offer"
    >
      <span className="text-lg md:text-xl font-semibold" data-testid="text-offer-title">
        ₹10 off on every product
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
