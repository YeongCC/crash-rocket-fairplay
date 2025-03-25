
import React from "react";
import { useGame } from "@/context/GameContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency } from "@/utils/gameUtils";

const LeaderBoard: React.FC = () => {
  const { activeBets, gameState, currentMultiplier } = useGame();
  
  // Sort bets by potential/actual results
  const sortedBets = [...activeBets].sort((a, b) => {
    // For cashed out bets, use actual result
    if (a.hashedOut && b.hashedOut) {
      return b.result - a.result;
    }
    
    // Cashed out bets go first
    if (a.hashedOut && !b.hashedOut) return -1;
    if (!a.hashedOut && b.hashedOut) return 1;
    
    // For active bets, use current potential
    return b.amount * currentMultiplier - a.amount * currentMultiplier;
  });
  
  return (
    <div className="glass-panel p-4 w-full max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-3">Current Bets</h3>
      
      <div className="space-y-2 max-h-[16rem] overflow-y-auto pr-2">
        {sortedBets.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No active bets</p>
        ) : (
          sortedBets.map((bet) => (
            <div 
              key={bet.id} 
              className="flex items-center justify-between p-2 rounded-lg hover:bg-black/5 transition-colors"
            >
              {/* User */}
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://avatar.vercel.sh/${bet.username}`} />
                  <AvatarFallback>{bet.username[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{bet.username}</p>
                  <p className="text-xs text-gray-500">${bet.amount.toFixed(2)}</p>
                </div>
              </div>
              
              {/* Status/Result */}
              <div className="text-right">
                {bet.hashedOut ? (
                  <div>
                    <p className="text-aviator-green font-medium">
                      {formatCurrency(bet.result)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {bet.actualMultiplier?.toFixed(2)}x
                    </p>
                  </div>
                ) : gameState === "running" ? (
                  <div>
                    <p className="font-medium">
                      {formatCurrency(bet.amount * currentMultiplier)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentMultiplier.toFixed(2)}x
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Waiting...</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeaderBoard;
