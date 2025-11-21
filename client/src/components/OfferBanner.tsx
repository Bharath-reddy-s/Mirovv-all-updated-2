import { useState, useEffect } from "react";

export default function OfferBanner() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 7);
      targetDate.setHours(23, 59, 59, 0);

      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center" data-testid={`timer-${label}`}>
      <div className="bg-red-600 text-white rounded-lg p-3 md:p-4 min-w-[60px] md:min-w-[80px] flex items-center justify-center">
        <span className="text-2xl md:text-3xl lg:text-4xl font-bold">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs md:text-sm text-gray-300 mt-2 uppercase tracking-wide">{label}</span>
    </div>
  );

  return (
    <section
      className="bg-black text-white py-8 md:py-12 px-4"
      data-testid="section-offer-banner"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-6 md:space-y-8">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-2" data-testid="text-offer-heading">
              🔥 Limited Time Offer 🔥
            </h2>
            <p className="text-lg md:text-2xl text-gray-300">
              Get exclusive deals on Mystery Boxes
            </p>
            <p className="text-sm md:text-base text-gray-400 mt-2">
              Sale ends in:
            </p>
          </div>

          <div
            className="flex gap-3 md:gap-6 justify-center items-end flex-wrap"
            data-testid="container-timer"
          >
            <TimeUnit value={timeLeft.days} label="Days" />
            <div className="text-3xl md:text-5xl font-bold text-red-600 mb-4">:</div>
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <div className="text-3xl md:text-5xl font-bold text-red-600 mb-4">:</div>
            <TimeUnit value={timeLeft.minutes} label="Minutes" />
            <div className="text-3xl md:text-5xl font-bold text-red-600 mb-4">:</div>
            <TimeUnit value={timeLeft.seconds} label="Seconds" />
          </div>

          <p className="text-xs md:text-sm text-gray-400">
            Don't miss out! Limited quantities available
          </p>
        </div>
      </div>
    </section>
  );
}
