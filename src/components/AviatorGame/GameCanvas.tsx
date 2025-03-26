
import React from "react";
import { useGame } from "@/context/GameContext";
import Rocket from "./Rocket";
import Multiplier from "./Multiplier";

const GameCanvas: React.FC = () => {
  const { gameState, nextGameCountdown } = useGame();
  
  return (
    <div className="relative bg-gradient-to-b from-aviator-darkBlue to-black rounded-xl overflow-hidden w-full h-[400px] shadow-xl">
      {/* Stars background */}
      <div className="absolute inset-0 z-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse-opacity"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* Rocket and trails */}
      <Rocket />
      
      {/* Multiplier */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <Multiplier />
      </div>
      
      {/* Countdown overlay */}
      {(gameState === "waiting" || gameState === "crashed") && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-black/20 z-40">
          <div className="text-center">
            <p className="text-xl text-white mb-2">Next round in</p>
            <p className="text-5xl font-bold text-white">{nextGameCountdown}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
