
import React from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const GameHistory: React.FC = () => {
  const { roundHistory } = useGame();
  
  const getMultiplierStyle = (multiplier: number) => {
    if (multiplier < 2) return "bg-gray-500";
    if (multiplier < 5) return "bg-aviator-yellow";
    return "bg-aviator-green";
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto glass-panel p-4">
      <h3 className="text-lg font-semibold mb-3">Recent Crashes</h3>
      <div className="flex flex-wrap gap-2">
        {roundHistory.length === 0 ? (
          <p className="text-gray-500">No game history yet</p>
        ) : (
          roundHistory.slice(0, 15).map((round, index) => (
            <Popover key={round.id || `round-${index}`}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "rounded-full h-10 min-w-10 px-3 text-white",
                    getMultiplierStyle(round.crashPoint)
                  )}
                >
                  {round.crashPoint.toFixed(2)}x
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-2">
                  <h4 className="font-bold">Round Details</h4>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    <p className="text-gray-500">Crash Point:</p>
                    <p className="font-medium">{round.crashPoint.toFixed(2)}x</p>
                    
                    <p className="text-gray-500">Time:</p>
                    <p className="font-medium">
                      {round.timestamp.toLocaleTimeString()}
                    </p>
                    
                    <p className="text-gray-500">Hash:</p>
                    <p className="font-medium truncate">
                      {round.serverSeed.substring(0, 8)}...
                    </p>
                  </div>
                  
                  {round.bets.length > 0 && (
                    <>
                      <h5 className="font-medium mt-3">Bets</h5>
                      <div className="max-h-40 overflow-y-auto">
                        {round.bets.map((bet) => (
                          <div 
                            key={bet.id} 
                            className="border-b border-gray-100 py-2 grid grid-cols-2 text-xs"
                          >
                            <div>
                              <p>{bet.username}</p>
                              <p className="text-gray-500">${bet.amount.toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                              {bet.hashedOut ? (
                                <p className="text-aviator-green font-medium">
                                  Cashed out: {bet.actualMultiplier?.toFixed(2)}x
                                </p>
                              ) : (
                                <p className="text-aviator-red">Bust</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Server seed: {round.serverSeed.substring(0, 12)}...
                    </p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          ))
        )}
      </div>
    </div>
  );
};

export default GameHistory;
