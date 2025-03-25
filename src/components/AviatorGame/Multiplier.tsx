
import React from "react";
import { useGame } from "@/context/GameContext";
import { cn } from "@/lib/utils";

const Multiplier: React.FC = () => {
  const { currentMultiplier, gameState } = useGame();
  
  const getMultiplierColor = () => {
    if (currentMultiplier < 2) return "text-white";
    if (currentMultiplier < 5) return "text-aviator-yellow";
    return "text-aviator-green";
  };
  
  const getMultiplierSize = () => {
    const baseSize = "text-4xl";
    const scale = Math.min(2, 1 + (currentMultiplier / 10));
    return `${baseSize} scale-${Math.floor(scale * 100)}`;
  };
  
  return (
    <div className="relative z-30 flex justify-center items-center h-32">
      {gameState === "crashed" ? (
        <div className="animate-fade-in flex flex-col items-center">
          <p className="text-aviator-red text-xl font-semibold">CRASHED</p>
          <p className={cn("multiplier-text", getMultiplierColor(), getMultiplierSize())}>
            {currentMultiplier.toFixed(2)}x
          </p>
        </div>
      ) : gameState === "waiting" ? (
        <div className="animate-pulse-opacity">
          <p className="text-xl font-light text-white">PREPARING NEXT FLIGHT</p>
        </div>
      ) : (
        <p 
          className={cn(
            "multiplier-text", 
            getMultiplierColor(),
            getMultiplierSize(),
            "animate-scale-in"
          )}
          style={{ 
            transform: `scale(${Math.min(1.5, 1 + (currentMultiplier / 20))})` 
          }}
        >
          {currentMultiplier.toFixed(2)}x
        </p>
      )}
    </div>
  );
};

export default Multiplier;
