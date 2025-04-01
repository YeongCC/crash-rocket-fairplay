
import React from "react";
import { GameProvider } from "@/context/GameContext";
import GameCanvas from "./GameCanvas";
import BettingPanel from "./BettingPanel";
import GameHistory from "./GameHistory";
import LeaderBoard from "./LeaderBoard";
import GameInfo from "./GameInfo";
import TimerBar from "./TimerBar";

const AviatorGame: React.FC = () => {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Game Info */}
          <GameInfo />
          
          {/* Main Game Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Leaderboard */}
            <div className="lg:col-span-1">
              <LeaderBoard />
            </div>
            
            {/* Center Column - Timer Bar and Game Canvas */}
            <div className="lg:col-span-1 space-y-2">
              <TimerBar />
              <GameCanvas />
            </div>
            
            {/* Right Column - Betting Panel */}
            <div className="lg:col-span-1">
              <BettingPanel />
            </div>
          </div>
          
          {/* Game History */}
          <div className="pt-4">
            {/* <GameHistory /> */}
          </div>
        </div>
      </div>
    </GameProvider>
  );
};

export default AviatorGame;
