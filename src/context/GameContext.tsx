// import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
// import { toast } from "sonner";
// import {
//   generateCrashPoint,
//   generateServerSeed,
//   calculateScalingFactor,
// } from "@/utils/gameUtils";

// const generateRandomUsername = (): string => {
//   const id = Math.floor(Math.random() * 100000);
//   return `Player_${id}`;
// };

// export type GameState = "waiting" | "running" | "crashed";

// interface Bet {
//   id: string;
//   amount: number;
//   actualMultiplier: number | null;
//   result: number;
//   hashedOut: boolean;
//   username: string;
// }

// interface GameContextType {
//   balance: number;
//   gameState: GameState;
//   currentMultiplier: number;
//   nextGameCountdown: number;
//   activeBets: Bet[];
//   placeBet: (amount: number) => void;
//   cancelBet: (betId: string) => void;
//   cashOut: (betId: string) => void;
//   autoBetEnabled: boolean;
//   setAutoBetEnabled: (enabled: boolean) => void;
//   autoBetAmount: number;
//   setAutoBetAmount: (amount: number) => void;
//   autoCashoutEnabled: boolean;
//   setAutoCashoutEnabled: (enabled: boolean) => void;
//   autoCashoutValue: number;
//   setAutoCashoutValue: (value: number) => void;
//   username: string;
//   roundId: any;
// }

// const GameContext = createContext<GameContextType | undefined>(undefined);

// export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [balance, setBalance] = useState(1000);
//   const [gameState, setGameState] = useState<GameState>("waiting");
//   const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
//   const [activeBets, setActiveBets] = useState<Bet[]>([]);
//   const [nextGameCountdown, setNextGameCountdown] = useState(5);
//   const [recentPayouts, setRecentPayouts] = useState<number[]>([]);
//   const [autoBetEnabled, setAutoBetEnabled] = useState(false);
//   const [autoBetAmount, setAutoBetAmount] = useState(10);
//   const [autoCashoutEnabled, setAutoCashoutEnabled] = useState(false);
//   const [autoCashoutValue, setAutoCashoutValue] = useState(2.0);
//   const [username] = useState(generateRandomUsername());
//   const [roundId, setRoundId] = useState(0); 

//   const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
//   const multiplierTimerRef = useRef<NodeJS.Timeout | null>(null);

//   const activeBetsRef = useRef(activeBets);
//   const autoCashoutEnabledRef = useRef(autoCashoutEnabled);
//   const autoCashoutValueRef = useRef(autoCashoutValue);
//   const currentMultiplierRef = useRef(currentMultiplier);

//   useEffect(() => { activeBetsRef.current = activeBets; }, [activeBets]);
//   useEffect(() => { autoCashoutEnabledRef.current = autoCashoutEnabled; }, [autoCashoutEnabled]);
//   useEffect(() => { autoCashoutValueRef.current = autoCashoutValue; }, [autoCashoutValue]);
//   useEffect(() => { currentMultiplierRef.current = currentMultiplier; }, [currentMultiplier]);

//   const startCountdown = () => {
//     clearInterval(countdownTimerRef.current!);
//     setGameState("waiting");
//     setNextGameCountdown(5);
//     setRoundId((prev) => prev + 1);
//     countdownTimerRef.current = setInterval(() => {
//       setNextGameCountdown((prev) => {
//         if (prev <= 1) {
//           clearInterval(countdownTimerRef.current!);

//           if (autoBetEnabled && balance >= autoBetAmount) {
//             placeBet(autoBetAmount);
//           }

//           startGame();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   const startGame = () => {
//     clearInterval(multiplierTimerRef.current!);
//     setGameState("running");
//     setCurrentMultiplier(1.0);

//     const scalingFactor = calculateScalingFactor(recentPayouts.slice(-10));
//     const serverSeed = generateServerSeed();
//     const crashPoint = generateCrashPoint(serverSeed, scalingFactor);

//     multiplierTimerRef.current = setInterval(() => {
//       setCurrentMultiplier((prev) => {
//         const next = parseFloat((prev + 0.01).toFixed(2));

//         if (autoCashoutEnabledRef.current) {
//           const userBet = activeBetsRef.current.find(
//             (b) => b.username === username && !b.hashedOut
//           );
//           if (userBet && next >= autoCashoutValueRef.current) {
//             cashOut(userBet.id);
//           }
//         }

//         if (next >= crashPoint) {
//           clearInterval(multiplierTimerRef.current!);
//           crashNow(crashPoint);
//           return crashPoint;
//         }

//         return next;
//       });
//     }, 100);
//   };

//   const crashNow = (finalMultiplier: number) => {
//     setGameState("crashed");

//     setActiveBets(prev =>
//       prev.map(b => !b.hashedOut
//         ? { ...b, actualMultiplier: finalMultiplier, result: 0, hashedOut: true }
//         : b
//       )
//     );

//     const maxPayout = activeBets.reduce((max, bet) => bet.result > max ? bet.result : max, 0);
//     setRecentPayouts(prev => [...prev.slice(-9), maxPayout]);
//     setActiveBets([]);
//     startCountdown();

//   };

//   const placeBet = (amount: number) => {
//     if (gameState !== "waiting") {
//       toast.error("Only bet during the preparation phase");
//       return;
//     }
//     if (balance < amount) {
//       toast.error("Insufficient balance");
//       return;
//     }

//     const alreadyExists = activeBets.some(b => b.username === username);
//     if (alreadyExists) {
//       toast.error("You have already placed a bet. You cannot place a bet again.");
//       return;
//     }

//     const newBet: Bet = {
//       id: Math.random().toString(36).substring(2, 9),
//       amount,
//       actualMultiplier: null,
//       result: 0,
//       hashedOut: false,
//       username,
//     };

//     setBalance((prev) => prev - amount);
//     setActiveBets((prev) => [...prev, newBet]);
//     toast.success(`Successful betting$${amount}`);
//   };

//   const cancelBet = (betId: string) => {
//     if (gameState !== "waiting") return;
//     const bet = activeBets.find((b) => b.id === betId && !b.hashedOut);
//     if (!bet) return;

//     setActiveBets((prev) => prev.filter((b) => b.id !== betId));
//     setBalance((prev) => prev + bet.amount);
//     toast.info(`Cancel bet, refund $${bet.amount}`);
//   };

//   const cashOut = (betId: string) => {
//     setActiveBets((prev) =>
//       prev.map((b) => {
//         if (b.id === betId && !b.hashedOut) {
//           const winnings = parseFloat((b.amount * currentMultiplierRef.current).toFixed(2));
//           setBalance((balance) => balance + winnings);
//           toast.success(`Cashout successful: $${winnings}`);
//           return {
//             ...b,
//             hashedOut: true,
//             actualMultiplier: currentMultiplierRef.current,
//             result: winnings,
//           };
//         }
//         return b;
//       })
//     );
//   };

//   useEffect(() => {
//     startCountdown();
//     return () => {
//       clearInterval(multiplierTimerRef.current!);
//       clearInterval(countdownTimerRef.current!);
//     };
//   }, []);

//   return (
//     <GameContext.Provider value={{
//       balance, gameState, currentMultiplier, nextGameCountdown,
//       activeBets, placeBet, cancelBet, cashOut,
//       autoBetEnabled, setAutoBetEnabled, autoBetAmount, setAutoBetAmount,
//       autoCashoutEnabled, setAutoCashoutEnabled, autoCashoutValue, setAutoCashoutValue,
//       username,roundId
//     }}>
//       {children}
//     </GameContext.Provider>
//   );
// };

// export const useGame = () => {
//   const context = useContext(GameContext);
//   if (!context) throw new Error("useGame must be used within GameProvider");
//   return context;
// };


import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { toast } from "sonner";
import { useCrashSocket, sendBet, sendCashOut, sendCancelBet } from "@/hooks/useCrashSocket";

export type GameState = "waiting" | "running" | "crashed";

export interface Bet {
  id: string;
  amount: number;
  actualMultiplier: number | null;
  result: number;
  hashedOut: boolean;
  username: string;
}

interface RoundHistory {
  id: number;
  crashPoint: number;
  timestamp: Date;
  serverSeed: string;
  bets: Bet[];
}

interface GameContextType {
  balance: number;
  gameState: GameState;
  currentMultiplier: number;
  nextGameCountdown: number;
  activeBets: Bet[];
  placeBet: (amount: number) => void;
  cancelBet: (betId: string) => void;
  cashOut: (betId: string) => void;
  autoBetEnabled: boolean;
  setAutoBetEnabled: (enabled: boolean) => void;
  autoBetAmount: number;
  setAutoBetAmount: (amount: number) => void;
  autoCashoutEnabled: boolean;
  setAutoCashoutEnabled: (enabled: boolean) => void;
  autoCashoutValue: number;
  setAutoCashoutValue: (value: number) => void;
  username: string;
  roundId: number;
  roundHistory: RoundHistory[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(1000);
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [activeBets, setActiveBets] = useState<Bet[]>([]);
  const [nextGameCountdown, setNextGameCountdown] = useState(5);
  const [roundHistory, setRoundHistory] = useState<RoundHistory[]>([]);
  const [autoBetEnabled, setAutoBetEnabled] = useState(false);
  const [autoBetAmount, setAutoBetAmount] = useState(10);
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState(false);
  const [autoCashoutValue, setAutoCashoutValue] = useState(1.05);
  const [username, setUsername] = useState("");
  const [roundId, setRoundId] = useState(0);
  const activeBetsRef = useRef(activeBets);
  const autoCashoutValueRef = useRef(autoCashoutValue);
  const autoCashoutEnabledRef = useRef(autoCashoutEnabled);
  const currentMultiplierRef = useRef(currentMultiplier);

  useEffect(() => { activeBetsRef.current = activeBets; }, [activeBets]);
  useEffect(() => { autoCashoutValueRef.current = autoCashoutValue; }, [autoCashoutValue]);
  useEffect(() => { autoCashoutEnabledRef.current = autoCashoutEnabled; }, [autoCashoutEnabled]);
  useEffect(() => { currentMultiplierRef.current = currentMultiplier; }, [currentMultiplier]);

  useCrashSocket(
    (uname) => setUsername(uname),
    (data) => {
      setGameState(data.state);
      setCurrentMultiplier(data.multiplier);
      setNextGameCountdown(data.countdown ?? 0);

      const bets = data.bets
        .map((b: any) => ({
          id: b.clientId,
          username: b.username,
          amount: b.amount,
          actualMultiplier: b.multiplier,
          result: b.cashedOut && b.multiplier ? b.amount * b.multiplier : 0,
          hashedOut: b.cashedOut,
        }))

      const prevActiveBets = activeBetsRef.current;

      const cashedOutBet = bets.find(
        (b) => b.username === username && b.hashedOut && !prevActiveBets.some(pb => pb.id === b.id && pb.hashedOut)
      );

      if (cashedOutBet) {
        const winAmount = cashedOutBet.amount * (cashedOutBet.actualMultiplier || currentMultiplierRef.current);
        setBalance(prev => prev + winAmount);
        toast.success(`Cashout successful: $${winAmount.toFixed(2)}`);
      }

      if (data.state === "crashed") {
        const userBet = bets.find(b => b.username === username && !b.hashedOut);
        if (userBet) {
          toast.error("Crashed! You lost your bet.");
        }

        setRoundHistory(prev => [{
          id: roundId,
          crashPoint: data.multiplier,
          timestamp: new Date(),
          serverSeed: data.crashPoint?.toString() || "-",
          bets,
        }, ...prev.slice(0, 29)]);

        setRoundId(prev => prev + 1);
      }

      setActiveBets(bets);
    }
  );

  const placeBet = (amount: number) => {
    if (gameState !== "waiting") {
      toast.error("Only bet during the preparation phase");
      return;
    }
    if (balance < amount) {
      toast.error("Insufficient balance");
      return;
    }

    const alreadyExists = activeBets.some(
      (b) => b.username === username && !b.hashedOut
    );

    if (alreadyExists) {
      toast.error("You already have an active bet.");
      return;
    }

    const newBet: Bet = {
      id: Math.random().toString(36).substring(2, 9),
      amount,
      actualMultiplier: null,
      result: 0,
      hashedOut: false,
      username,
    };
    setBalance(prev => prev - amount);
    setActiveBets(prev => [...prev, newBet]);
    sendBet(amount);
    toast.success(`Bet placed: $${amount}`);
  };

  const cancelBet = (betId: string) => {
    if (gameState !== "waiting") return;
    const bet = activeBets.find(b => b.id === betId && !b.hashedOut);
    if (!bet) return;

    setBalance(prev => prev + bet.amount);
    setActiveBets(prev => prev.filter(b => b.id !== betId));
    sendCancelBet(bet.id);
    toast.info(`Bet canceled: refunded $${bet.amount}`);
  };

  const cashOut = (betId: string) => {
    const bet = activeBets.find(b => b.id === betId && !b.hashedOut);
    if (!bet) return;

    const winnings = bet.amount * currentMultiplier;
    setBalance(prev => prev + winnings);

    setActiveBets(prev => prev.map(b => b.id === betId ? {
      ...b,
      hashedOut: true,
      actualMultiplier: currentMultiplier,
      result: winnings,
    } : b));

    sendCashOut();
    toast.success(`Cashout successful: $${winnings.toFixed(2)}`);
  };

  useEffect(() => {
    if (autoCashoutEnabled && gameState === "running") {
      const bet = activeBets.find(b => b.username === username && !b.hashedOut);
      if (bet && currentMultiplier >= autoCashoutValue) {
        cashOut(bet.id);
      }
    }
  }, [autoCashoutEnabled, currentMultiplier, activeBets, autoCashoutValue, gameState, username]);

  return (
    <GameContext.Provider value={{
      balance, gameState, currentMultiplier, nextGameCountdown,
      activeBets, placeBet, cancelBet, cashOut,
      autoBetEnabled, setAutoBetEnabled, autoBetAmount, setAutoBetAmount,
      autoCashoutEnabled, setAutoCashoutEnabled, autoCashoutValue, setAutoCashoutValue,
      username, roundId, roundHistory
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};
