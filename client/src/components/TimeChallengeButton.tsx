import { useState, useRef, useEffect } from "react";
import { useTimeChallenge } from "@/contexts/TimeChallengeContext";
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

  const [isMounted, setIsMounted] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    setPosition({ x: 20, y: window.innerHeight - 120 });
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 70),
        y: Math.min(prev.y, window.innerHeight - 70),
      }));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMounted]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragRef.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragRef.current.startX;
    const deltaY = touch.clientY - dragRef.current.startY;
    
    const newX = Math.max(10, Math.min(window.innerWidth - 70, dragRef.current.startPosX + deltaX));
    const newY = Math.max(10, Math.min(window.innerHeight - 70, dragRef.current.startPosY + deltaY));
    
    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    if (!dragRef.current) return;
    const moved = Math.abs(position.x - dragRef.current.startPosX) > 5 || 
                  Math.abs(position.y - dragRef.current.startPosY) > 5;
    
    if (!moved) {
      setIsExpanded(!isExpanded);
    }
    
    dragRef.current = null;
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
    setIsDragging(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      
      const newX = Math.max(10, Math.min(window.innerWidth - 70, dragRef.current.startPosX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 70, dragRef.current.startPosY + deltaY));
      
      setPosition({ x: newX, y: newY });
    };
    
    const handleMouseUp = () => {
      if (dragRef.current) {
        const moved = Math.abs(position.x - dragRef.current.startPosX) > 5 || 
                      Math.abs(position.y - dragRef.current.startPosY) > 5;
        
        if (!moved) {
          setIsExpanded(!isExpanded);
        }
      }
      
      dragRef.current = null;
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  if (!isMounted || !isChallengeActive) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={buttonRef}
      className="fixed z-50 select-none touch-none"
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      data-testid="time-challenge-button"
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            key="collapsed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-14 h-14 rounded-full bg-black dark:bg-white flex items-center justify-center shadow-lg"
          >
            {challengeStarted && !challengeExpired ? (
              <span className="text-white dark:text-black font-bold text-sm" data-testid="text-challenge-timer-collapsed">
                {formatTime(timeRemaining)}
              </span>
            ) : (
              <Timer className="w-6 h-6 text-white dark:text-black" />
            )}
          </motion.div>
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
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="text-white/70 dark:text-black/70 hover:text-white dark:hover:text-black"
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
                  onClick={(e) => {
                    e.stopPropagation();
                    startChallenge();
                  }}
                  className="w-full hover:bg-green-600 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-[#000000] bg-[#fafafa]"
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
                  onClick={(e) => {
                    e.stopPropagation();
                    startChallenge();
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
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
