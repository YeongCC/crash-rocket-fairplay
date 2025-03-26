
import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { Progress } from "@/components/ui/progress";
import { formatDistance } from "date-fns";

const TimerBar: React.FC = () => {
  const { gameState, currentMultiplier } = useGame();
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [progress, setProgress] = useState(0);
  
  // Update current time every 100ms
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  // Set start time when game starts running
  useEffect(() => {
    if (gameState === "running" && !startTime) {
      setStartTime(new Date());
    } else if (gameState === "waiting") {
      setStartTime(null);
      setProgress(0);
    }
  }, [gameState]);
  
  // Calculate progress based on time passed
  useEffect(() => {
    if (startTime && gameState === "running") {
      const elapsed = currentTime.getTime() - startTime.getTime();
      // Cap at 100% (estimated max duration of 10 seconds)
      const calculatedProgress = Math.min(100, (elapsed / 10000) * 100);
      setProgress(calculatedProgress);
    } else if (gameState === "crashed") {
      setProgress(100);
    }
  }, [currentTime, startTime, gameState]);
  
  // Format the display times
  const getTimeDisplay = () => {
    if (!startTime) return { start: "--:--", elapsed: "0.0s" };
    
    const start = startTime.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
    
    const elapsedMs = currentTime.getTime() - startTime.getTime();
    const elapsed = (elapsedMs / 1000).toFixed(1) + 's';
    
    return { start, elapsed };
  };
  
  const times = getTimeDisplay();
  
  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-xs text-white">
        <span>Start: {times.start}</span>
        <span>Time: {times.elapsed}</span>
        <span>Multiplier: {currentMultiplier.toFixed(2)}x</span>
      </div>
      <Progress 
        value={progress} 
        className="h-2 bg-aviator-darkBlue/50" 
      />
    </div>
  );
};

export default TimerBar;
