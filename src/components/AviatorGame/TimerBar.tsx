
import React from "react";
import { useGame } from "@/context/GameContext";
import { Progress } from "@/components/ui/progress";

const TimerBar: React.FC = () => {
  const { gameState, nextGameCountdown, currentMultiplier } = useGame();
  
  // Show different content based on game state
  const renderContent = () => {
    if (gameState === "waiting" || gameState === "crashed") {
      return (
        <div className="w-full space-y-1">
          <div className="flex justify-between text-xs text-gray-200">
            <span>Starting in: {nextGameCountdown} seconds</span>
            <span>Preparing next flight</span>
          </div>
          <Progress 
            value={(nextGameCountdown / 15) * 100} 
            className="h-2 bg-aviator-darkBlue/50" 
          />
        </div>
      );
    } else {
      return (
        <div className="w-full space-y-1">
          <div className="flex justify-between text-xs text-gray-200">
            <span>Game in progress</span>
            <span>Current multiplier: {currentMultiplier.toFixed(2)}x</span>
          </div>
          <Progress 
            value={100} 
            className="h-2 bg-aviator-darkBlue/50" 
          />
        </div>
      );
    }
  };
  
  return (
    <div className="w-full bg-aviator-darkBlue p-2 rounded-lg mb-2">
      {renderContent()}
    </div>
  );
};

export default TimerBar;
