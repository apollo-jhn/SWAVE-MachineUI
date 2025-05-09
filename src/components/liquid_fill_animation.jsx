import React, { useState, useEffect } from "react";

export function LiquidFillAnimation({
  duration = 2000,
  onComplete,
  showTimeRemaining = true,
  containerClassName = "",
}) {
  const [progress, setProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(duration / 1000);
  const [isFilling, setIsFilling] = useState(true);

  const ANIMATION_UPDATE_INTERVAL = 100;
  const startTimeRef = React.useRef(null);

  useEffect(() => {
    let intervalId;

    if (isFilling) {
      startTimeRef.current = Date.now();

      intervalId = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const newProgress = Math.min(100, (elapsed / duration) * 100);
        const newRemaining = Math.max(0, (duration - elapsed) / 1000);

        setProgress(newProgress);
        setRemainingTime(newRemaining);

        if (elapsed >= duration) {
          clearInterval(intervalId);
          setIsFilling(false);
          setProgress(100);
          setRemainingTime(0);
          if (onComplete) onComplete();
        }
      }, ANIMATION_UPDATE_INTERVAL);
    }

    return () => clearInterval(intervalId);
  }, [isFilling, duration]);

  const formatTime = (seconds) => seconds.toFixed(1);

  return (
    <div className={`flex flex-col items-center ${containerClassName}`}>
      {showTimeRemaining && isFilling && (
        <div className="mb-2 text-lg font-semibold text-blue-800">
          Time remaining: {formatTime(remainingTime)}s
        </div>
      )}

      {/* Glass of Water */}
      <div className="relative w-24 h-40 border-4 border-blue-300 rounded-b-lg overflow-hidden bg-white">
        {/* Liquid fill */}
        <div
          className="absolute bottom-0 w-full bg-blue-400 transition-all duration-300"
          style={{ height: `${progress}%` }}
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-blue-300 opacity-70 animate-pulse" />
        </div>
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-300 opacity-40" />
      </div>

      <div className="w-4/5 mt-2 bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-lg font-bold text-blue-800 mt-1">
        {Math.round(progress)}%
      </p>
    </div>
  );
}
