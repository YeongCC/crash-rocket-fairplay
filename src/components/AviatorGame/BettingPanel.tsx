import React, { useState, useEffect, useRef } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const BettingPanel: React.FC = () => {
  const {
    balance,
    gameState,
    currentMultiplier,
    activeBets,
    placeBet,
    cancelBet,
    cashOut,
    autoBetEnabled,
    setAutoBetEnabled,
    autoBetAmount,
    setAutoBetAmount,
    autoCashoutEnabled,
    setAutoCashoutEnabled,
    autoCashoutValue,
    setAutoCashoutValue,
    username,
    roundId,
  } = useGame();

  const [betAmount, setBetAmount] = useState<number>(10);
  const lastAutoBetRound = useRef<number | null>(null);

  const currentBet = activeBets.find(
    (b) => b.username === username && !b.hashedOut
  );

  useEffect(() => {
    const alreadyBet = activeBets.some(
      (b) => b.username === username && !b.hashedOut
    );
  
    if (
      autoBetEnabled &&
      gameState === "waiting" &&
      !alreadyBet &&
      balance >= autoBetAmount &&
      lastAutoBetRound.current !== roundId
    ) {
      placeBet(autoBetAmount);
      lastAutoBetRound.current = roundId;
    }
  }, [
    autoBetEnabled,
    gameState,
    roundId,
    activeBets,
    balance,
    autoBetAmount,
    placeBet,
    username,
  ]);
  

  const handlePlaceBet = () => {
    if (betAmount < 1) {
      toast.error("下注金额必须 ≥ 1");
      return;
    }

    placeBet(betAmount);
  };

  const betOptions = [5, 10, 25, 50, 100];

  return (
    <div className="glass-panel p-6 w-full max-w-md mx-auto">
      <div className="mb-6 text-center">
        <p className="text-sm text-gray-600">Balance</p>
        <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Bet Amount</label>
          <Input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            min={1}
            disabled={!!currentBet && gameState === "running"}
          />
          <div className="flex gap-2 mt-2 flex-wrap">
            {betOptions.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setBetAmount(amount)}
                className={cn(
                  "flex-1 min-w-0",
                  betAmount === amount && "bg-accent text-accent-foreground"
                )}
                disabled={!!currentBet && gameState === "running"}
              >
                ${amount}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">Auto Cashout</label>
            <Switch
              checked={autoCashoutEnabled}
              onCheckedChange={(checked) => setAutoCashoutEnabled(checked)}
            />
          </div>
          <Input
            type="number"
            value={autoCashoutValue}
            onChange={(e) => setAutoCashoutValue(Number(e.target.value))}
            min={1.1}
            step={0.1}
            disabled={!autoCashoutEnabled}
          />
        </div>

        <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
          <label className="text-sm font-medium">Auto Bet (Next Rounds)</label>
          <Switch
            checked={autoBetEnabled}
            onCheckedChange={(checked) => {
              setAutoBetEnabled(checked);
              setAutoBetAmount(betAmount);
            }}
          />
        </div>

        <div className="pt-4">
          {gameState === "running" && currentBet && !currentBet.hashedOut && (
            <Button
              onClick={() => cashOut(currentBet.id)}
              className="w-full h-14 bg-aviator-green hover:bg-aviator-green/90 text-white font-bold text-xl"
            >
              Cash Out (${(currentBet.amount * currentMultiplier).toFixed(2)})
            </Button>
          )}

          {(gameState === "waiting" || gameState === "crashed") &&
            currentBet && !currentBet.hashedOut && (
              <Button
                onClick={() => cancelBet(currentBet.id)}
                className="w-full h-14 bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-xl"
              >
                Cancel Bet
              </Button>
            )}

          {(gameState === "waiting" || gameState === "crashed") &&
            !currentBet && (
              <Button
                onClick={handlePlaceBet}
                className="w-full h-14 bg-aviator-red hover:bg-aviator-red/90 text-white font-bold text-xl"
              >
                Place Bet
              </Button>
            )}

          {gameState === "running" && !currentBet && (
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
