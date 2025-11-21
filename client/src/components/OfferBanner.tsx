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
    <div className="w-full flex justify-center px-4 py-3 bg-gray-50 dark:bg-neutral-900">
      <div
        className="relative w-full max-w-4xl bg-black text-white rounded-b-[2rem] overflow-hidden shadow-2xl"
        data-testid="banner-offer"
      >
        <div className="py-6 px-8 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4" data-testid="text-offer-title">
            ₹10 off on every product
          </h2>
          
          <div className="flex justify-center items-center gap-1" data-testid="container-timer">
            <div className="flex items-baseline">
              <span className="text-5xl md:text-6xl lg:text-7xl font-bold tabular-nums" data-testid="text-hours">
                {timeLeft.hours}
              </span>
              <span className="text-4xl md:text-5xl lg:text-6xl font-bold mx-1">:</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-5xl md:text-6xl lg:text-7xl font-bold tabular-nums" data-testid="text-minutes">
                {timeLeft.minutes}
              </span>
              <span className="text-4xl md:text-5xl lg:text-6xl font-bold mx-1">:</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-5xl md:text-6xl lg:text-7xl font-bold tabular-nums" data-testid="text-seconds">
                {timeLeft.seconds}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
