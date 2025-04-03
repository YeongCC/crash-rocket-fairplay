import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:3000"); // 換成你的後端地址

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

export const sendBet = (amount: number) => {
  socket.emit("place_bet", { amount });
};

export const sendCashOut = () => {
  socket.emit("cash_out");
};
