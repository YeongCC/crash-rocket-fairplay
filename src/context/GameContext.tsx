
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  generateCrashPoint, 
  generateServerSeed, 
  calculateScalingFactor,
  calculateBetResult,
  validateBetAmount
} from "@/utils/gameUtils";
import { toast } from "sonner";

// Game states
export type GameState = "waiting" | "running" | "crashed";

// Types for bet
export interface Bet {
  id: string;
  amount: number;
  targetMultiplier: number | null;
  actualMultiplier: number | null;
  timestamp: Date;
  result: number;
  username: string;
  autoCashout: boolean;
  hashedOut: boolean;
}

// Types for game history
export interface GameRound {
  id: string;
  crashPoint: number;
  timestamp: Date;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  bets: Bet[];
}

// Context interface
interface GameContextType {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  gameState: GameState;
  currentMultiplier: number;
  currentServerSeed: string;
  roundHistory: GameRound[];
  activeBets: Bet[];
  placeBet: (amount: number, autoCashout: boolean, targetMultiplier: number | null) => void;
  cancelBet: (betId: string) => void; // Add cancel bet function
  cashOut: (betId: string) => void;
  currentRoundId: string | null;
  nextGameCountdown: number;
  autoBetSettings: {
    enabled: boolean;
    amount: number;
    targetMultiplier: number;
  };
  setAutoBetSettings: React.Dispatch<React.SetStateAction<{
    enabled: boolean;
    amount: number;
    targetMultiplier: number;
  }>>;
}

// Create context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // User balance
  const [balance, setBalance] = useState<number>(1000);
  
  // Game state
  const [gameState, setGameState] = useState<GameState>("waiting");
  
  // Current multiplier (updates during the game)
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.00);
  
  // Crash point for the current round (hidden from user until crash)
  const [currentCrashPoint, setCurrentCrashPoint] = useState<number>(1.00);
  
  // Server seed for the current round
  const [currentServerSeed, setCurrentServerSeed] = useState<string>("");
  
  // Game history
  const [roundHistory, setRoundHistory] = useState<GameRound[]>([]);
  
  // Active bets in the current round
  const [activeBets, setActiveBets] = useState<Bet[]>([]);
  
  // Current round ID
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
  
  // Countdown to next game
  const [nextGameCountdown, setNextGameCountdown] = useState<number>(15);
  
  // Auto bet settings
  const [autoBetSettings, setAutoBetSettings] = useState({
    enabled: false,
    amount: 10,
    targetMultiplier: 2.0
  });
  
  // Interval for updating multiplier
  const [multiplierInterval, setMultiplierInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Start a new game round
  const startNewRound = () => {
    // Generate a new round ID
    const newRoundId = Math.random().toString(36).substring(2, 15);
    setCurrentRoundId(newRoundId);
    
    // Calculate scaling factor based on recent history (last 10 rounds)
    const recentPayouts = roundHistory
      .slice(0, 10)
      .map(round => round.crashPoint);
    const scalingFactor = calculateScalingFactor(recentPayouts);
    
    // Generate server seed and crash point
    const serverSeed = generateServerSeed();
    setCurrentServerSeed(serverSeed);
    
    // Generate crash point
    const crashPoint = generateCrashPoint(serverSeed, scalingFactor);
    console.log(`New round starting. Crash point: ${crashPoint}`);
    setCurrentCrashPoint(crashPoint);
    
    // Reset current multiplier
    setCurrentMultiplier(1.00);
    
    // Reset active bets for the new round
    setActiveBets([]);
    
    // Set game state to running
    setGameState("running");
    
    // Apply auto bet if enabled
    if (autoBetSettings.enabled) {
      setTimeout(() => {
        placeBet(
          autoBetSettings.amount, 
          true, 
          autoBetSettings.targetMultiplier
        );
      }, 500);
    }
    
    // Start updating multiplier
    const interval = setInterval(() => {
      setCurrentMultiplier(prev => {
        const newMultiplier = prev + 0.01;
        
        // Check if the new multiplier is greater than or equal to the crash point
        if (newMultiplier >= crashPoint) {
          // Clear interval
          clearInterval(interval);
          
          // Set game state to crashed
          setGameState("crashed");
          
          // Process losing bets
          processLostBets();
          
          // Start countdown for new round immediately
          setNextGameCountdown(15);
          const countdownInterval = setInterval(() => {
            setNextGameCountdown(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                startNewRound();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          return crashPoint;
        }
        
        return parseFloat(newMultiplier.toFixed(2));
      });
      
      // Process auto cashouts - check more frequently
      checkAutoCashouts();
    }, 100);
    
    setMultiplierInterval(interval);
  };
  
  // Process lost bets (when the game crashes)
  const processLostBets = () => {
    // Get all active bets that haven't been cashed out
    const lostBets = activeBets.filter(bet => !bet.hashedOut);
    
    // Update the bets with the crash result
    const updatedLostBets = lostBets.map(bet => ({
      ...bet,
      actualMultiplier: currentCrashPoint,
      result: 0 // They lost their bet
    }));
    
    // Update active bets
    setActiveBets(prev => 
      prev.map(bet => 
        bet.hashedOut ? bet : updatedLostBets.find(lostBet => lostBet.id === bet.id) || bet
      )
    );
    
    // Add the round to history
    const newRound: GameRound = {
      id: currentRoundId!,
      crashPoint: currentCrashPoint,
      timestamp: new Date(),
      serverSeed: currentServerSeed,
      clientSeed: "player_seed", // In a real game, the client would provide this
      nonce: roundHistory.length + 1,
      bets: [...activeBets]
    };
    
    setRoundHistory(prev => [newRound, ...prev]);
  };
  
  // Check for auto cashouts
  const checkAutoCashouts = () => {
    // Get all active bets with auto cashout enabled
    const autoCashoutBets = activeBets.filter(
      bet => bet.autoCashout && bet.targetMultiplier !== null && !bet.hashedOut
    );
    
    // Check if any bets need to be auto cashed out
    autoCashoutBets.forEach(bet => {
      if (bet.targetMultiplier! <= currentMultiplier) {
        console.log(`Auto-cashout triggered for bet ${bet.id} at ${currentMultiplier}x (target: ${bet.targetMultiplier}x)`);
        cashOut(bet.id, true);
      }
    });
  };
  
  // Cancel a bet (only during waiting state)
  const cancelBet = (betId: string) => {
    // Find the bet
    const betIndex = activeBets.findIndex(bet => bet.id === betId);
    
    if (betIndex === -1) {
      toast.error("Bet not found");
      return;
    }
    
    const bet = activeBets[betIndex];
    
    // Check if bet has already been cashed out
    if (bet.hashedOut) {
      toast.error("Bet already completed");
      return;
    }
    
    // Return the funds
    setBalance(prev => prev + bet.amount);
    
    // Remove the bet from active bets
    setActiveBets(prev => prev.filter(b => b.id !== betId));
    
    toast.info(`Bet canceled: $${bet.amount.toFixed(2)} returned`);
  };
  
  // Place a bet
  const placeBet = (
    amount: number, 
    autoCashout: boolean = false, 
    targetMultiplier: number | null = null
  ) => {
    // Validate bet amount
    if (!validateBetAmount(amount, balance)) {
      return;
    }
    
    console.log(`Placing bet: $${amount}, autoCashout: ${autoCashout}, target: ${targetMultiplier}x`);
    
    // Create new bet
    const newBet: Bet = {
      id: Math.random().toString(36).substring(2, 15),
      amount,
      targetMultiplier,
      actualMultiplier: null,
      timestamp: new Date(),
      result: 0,
      username: "Player", // In a real game, this would be the user's name
      autoCashout,
      hashedOut: false
    };
    
    // Update balance
    setBalance(prev => prev - amount);
    
    // Check if there's already an active bet for this user
    const existingBet = activeBets.find(bet => bet.username === "Player" && !bet.hashedOut);
    if (existingBet) {
      // Replace the existing bet
      setActiveBets(prev => [
        ...prev.filter(bet => bet.id !== existingBet.id),
        newBet
      ]);
    } else {
      // Add bet to active bets
      setActiveBets(prev => [...prev, newBet]);
    }
    
    toast.success(`Bet placed: $${amount}`);
  };
  
  // Cash out
  const cashOut = (betId: string, isAuto: boolean = false) => {
    // Find the bet
    const betIndex = activeBets.findIndex(bet => bet.id === betId);
    
    if (betIndex === -1) {
      console.error("Bet not found:", betId);
      return;
    }
    
    const bet = activeBets[betIndex];
    
    // Check if bet has already been cashed out
    if (bet.hashedOut) {
      console.error("Bet already cashed out:", betId);
      return;
    }
    
    // Calculate winnings
    const winnings = bet.amount * currentMultiplier;
    
    // Update bet
    const updatedBet: Bet = {
      ...bet,
      hashedOut: true,
      actualMultiplier: currentMultiplier,
      result: winnings
    };
    
    // Update active bets
    setActiveBets(prev => {
      const newBets = [...prev];
      newBets[betIndex] = updatedBet;
      return newBets;
    });
    
    // Update balance
    setBalance(prev => prev + winnings);
    
    if (isAuto) {
      toast.success(`Auto Cash Out: $${winnings.toFixed(2)} at ${currentMultiplier.toFixed(2)}x`);
    } else {
      toast.success(`Cashed out: $${winnings.toFixed(2)} at ${currentMultiplier.toFixed(2)}x`);
    }
  };
  
  // Initialize the game
  useEffect(() => {
    // Don't start the first round immediately, start with a countdown
    setGameState("waiting");
    setNextGameCountdown(15);
    
    const countdownInterval = setInterval(() => {
      setNextGameCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          startNewRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Clean up on unmount
    return () => {
      if (multiplierInterval) {
        clearInterval(multiplierInterval);
      }
      clearInterval(countdownInterval);
    };
  }, []);
  
  // Context value
  const contextValue: GameContextType = {
    balance,
    setBalance,
    gameState,
    currentMultiplier,
    currentServerSeed,
    roundHistory,
    activeBets,
    placeBet,
    cancelBet,
    cashOut,
    currentRoundId,
    nextGameCountdown,
    autoBetSettings,
    setAutoBetSettings
  };
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  
  return context;
};
