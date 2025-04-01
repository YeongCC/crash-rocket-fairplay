import React from "react";
import { useGame } from "@/context/GameContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency } from "@/utils/gameUtils";

const LeaderBoard: React.FC = () => {
  const { activeBets, gameState, currentMultiplier } = useGame();

  const uniqueBetsMap = new Map<string, typeof activeBets[0]>();
  for (let bet of activeBets) {
    uniqueBetsMap.set(bet.username, bet);
  }
  const uniqueBets = Array.from(uniqueBetsMap.values());

  const sortedBets = [...uniqueBets].sort((a, b) => {
    if (a.hashedOut && b.hashedOut) {
      return b.result - a.result;
    }
    if (a.hashedOut) return -1;
    if (b.hashedOut) return 1;
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
              <div className="text-right">
                {bet.hashedOut ? (
                  <>
                    <p className="text-aviator-green font-medium">
                      {formatCurrency(bet.result)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {bet.actualMultiplier?.toFixed(2)}x
                    </p>
                  </>
                ) : gameState === "running" ? (
                  <>
                    <p className="font-medium">
                      {formatCurrency(bet.amount * currentMultiplier)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentMultiplier.toFixed(2)}x
                    </p>
                  </>
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
