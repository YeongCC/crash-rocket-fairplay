
import React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info, HelpCircle } from "lucide-react";

const GameInfo: React.FC = () => {
  return (
    <div className="flex items-center justify-between w-full max-w-5xl mx-auto px-4 py-2">
      <h1 className="text-2xl font-bold">Aviator</h1>
      
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-2">
              <h4 className="font-bold">How to Play</h4>
              <p className="text-sm">
                Aviator is a multiplayer game where you bet on the multiplier before the plane flies away.
              </p>
              <ol className="text-sm list-decimal pl-4 space-y-1">
                <li>Place your bet and wait for the round to start</li>
                <li>Watch as the multiplier increases</li>
                <li>Cash out before the plane flies away to secure your winnings</li>
                <li>If you don't cash out in time, you lose your bet</li>
              </ol>
              <p className="text-sm mt-2">
                You can set auto-cashout to automatically cash out at a specific multiplier.
              </p>
            </div>
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <Info className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-2">
              <h4 className="font-bold">Provably Fair</h4>
              <p className="text-sm">
                Aviator uses a provably fair system to ensure that game results cannot be manipulated.
              </p>
              <p className="text-sm mt-2">
                Each round's crash point is determined by a cryptographic hash that is generated before the round starts. This hash can be verified after the round to ensure the result was fair.
              </p>
              <div className="mt-3 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  The game has a 97% RTP (Return to Player), with a 3% house edge.
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default GameInfo;
