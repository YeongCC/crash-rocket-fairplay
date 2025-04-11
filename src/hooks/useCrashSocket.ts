import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { getOrCreateUsername } from "@/utils/username";

const username = getOrCreateUsername();
// const socket: Socket = io("http://localhost:3000/", {
//   query: { username },
// }); 
const socket: Socket = io("https://crash-game-backend.onrender.com/", {
  query: { username },
}); 

export const useCrashSocket = (
  onInit: (username: string) => void,
  onGameState: (data: any) => void
) => {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("🟢 Connected");
    });

    socket.on("init", ({ username }) => {
      onInit(username);
    });

    socket.on("game_state", (data) => {
      onGameState(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
};

export const sendBet = (amount: number, autoCashout?: number) => {
  socket.emit("place_bet", { amount, autoCashout });
};

export const sendCashOut = () => {
  socket.emit("cash_out");
};

export const sendCancelBet = (betId: string) => {
  socket.emit("cancel_bet", { betId });
};