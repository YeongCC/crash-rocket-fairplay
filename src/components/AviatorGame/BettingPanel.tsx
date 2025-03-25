
import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const BettingPanel: React.FC = () => {
  const { 
    balance, 
    gameState, 
    placeBet,
    cashOut,
    activeBets,
    autoBetSettings,
    setAutoBetSettings
  } = useGame();
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [autoCashoutValue, setAutoCashoutValue] = useState<number>(2.0);
  const [isAutoCashout, setIsAutoCashout] = useState<boolean>(false);
  
  // Get user's active bet in current round
  const activeUserBet = activeBets.find(bet => bet.username === "Player" && !bet.hashedOut);
  
  // Handle placing a bet
  const handlePlaceBet = () => {
    placeBet(betAmount, isAutoCashout, isAutoCashout ? autoCashoutValue : null);
  };
  
  // Handle cashing out
  const handleCashOut = () => {
    if (activeUserBet) {
      cashOut(activeUserBet.id);
    }
  };
  
  // Handle auto bet toggle
  const handleAutoBetToggle = (enabled: boolean) => {
    setAutoBetSettings(prev => ({
      ...prev,
      enabled,
      amount: betAmount,
      targetMultiplier: autoCashoutValue
    }));
  };
  
  // Pre-set bet amounts
  const betOptions = [5, 10, 25, 50, 100];
  
  return (
    <div className="glass-panel p-6 w-full max-w-md mx-auto">
      {/* Balance */}
      <div className="mb-6 text-center">
        <p className="text-sm text-gray-600">Balance</p>
        <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
      </div>
      
      {/* Bet Form */}
      <div className="space-y-5">
        {/* Bet Amount */}
        <div>
          <label htmlFor="betAmount" className="block text-sm font-medium mb-1">
            Bet Amount
          </label>
          <Input
            id="betAmount"
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="w-full betting-input"
            min={1}
            disabled={gameState === "running" && activeUserBet}
          />
          
          {/* Quick bet options */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {betOptions.map(amount => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setBetAmount(amount)}
                className={cn(
                  "flex-1 min-w-0",
                  betAmount === amount && "bg-accent text-accent-foreground"
                )}
                disabled={gameState === "running" && activeUserBet}
              >
                ${amount}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Auto Cashout */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="autoCashout" className="text-sm font-medium">
              Auto Cashout
            </label>
            <Switch
              id="autoCashout"
              checked={isAutoCashout}
              onCheckedChange={setIsAutoCashout}
              disabled={gameState === "running" && activeUserBet}
            />
          </div>
          <Input
            id="autoCashoutValue"
            type="number"
            value={autoCashoutValue}
            onChange={(e) => setAutoCashoutValue(Number(e.target.value))}
            className="w-full betting-input"
            min={1.1}
            step={0.1}
            disabled={!isAutoCashout || (gameState === "running" && activeUserBet)}
          />
        </div>
        
        {/* Auto Bet */}
        <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
          <label htmlFor="autoBet" className="text-sm font-medium">
            Auto Bet (Next Rounds)
          </label>
          <Switch
            id="autoBet"
            checked={autoBetSettings.enabled}
            onCheckedChange={handleAutoBetToggle}
          />
        </div>
        
        {/* Action Buttons */}
        <div className="pt-4">
          {gameState === "running" && activeUserBet && !activeUserBet.hashedOut ? (
            <Button 
              onClick={handleCashOut}
              className="w-full h-14 bg-aviator-green hover:bg-aviator-green/90 text-white font-bold text-xl"
            >
              Cash Out ({(activeUserBet.amount * useGame().currentMultiplier).toFixed(2)})
            </Button>
          ) : gameState !== "running" ? (
            <Button 
              onClick={handlePlaceBet}
              className="w-full h-14 bg-aviator-red hover:bg-aviator-red/90 text-white font-bold text-xl"
              disabled={gameState === "running" && !!activeUserBet}
            >
              Place Bet
            </Button>
          ) : (
            <Button 
              disabled
              className="w-full h-14 bg-gray-400 text-white font-bold text-xl cursor-not-allowed"
            >
              Next Round
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BettingPanel;
