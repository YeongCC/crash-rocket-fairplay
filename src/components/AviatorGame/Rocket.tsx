import React, { useEffect, useRef } from "react";
import { useGame } from "@/context/GameContext";
import { Rocket as RocketIcon } from "lucide-react";

const Rocket: React.FC = () => {
  const { gameState, currentMultiplier } = useGame();
  const rocketRef = useRef<HTMLDivElement>(null);
  const trailsContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const createTrail = () => {
    if (!rocketRef.current || !trailsContainerRef.current) return;

    const rocketEl = rocketRef.current;
    const trailsContainer = trailsContainerRef.current;
    const rect = rocketEl.getBoundingClientRect();

    const trail = document.createElement("div");
    trail.className = "rocket-trail";
    trail.style.width = `${30 + Math.random() * 20}px`;
    trail.style.left = `${rect.left}px`;
    trail.style.top = `${rect.top + rect.height / 2}px`;

    trailsContainer.appendChild(trail);

    setTimeout(() => {
      trail.remove();
    }, 300);
  };

  useEffect(() => {
    if (gameState === "running") {
      let lastTrailTime = 0;

      const animate = (time: number) => {
        if (time - lastTrailTime > 50) {
          createTrail();
          lastTrailTime = time;
        }

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [gameState]);

  const getFlightPosition = (multiplier: number) => {
    const local = multiplier % 3;
  
    const startX = 0; 
    const startY = 0;
    const amplitudeX = 10;
    const amplitudeY = 15;
  
    let x, y;
  
    if (local <= 1.5) {
      const t = local / 1.5; // 0 → 1
      x = startX + t * amplitudeX;
      y = startY + t * amplitudeY;
    } else {
      const t = (local - 1.5) / 1.5; // 0 → 1
      x = startX + amplitudeX * (1 - t);
      y = startY + amplitudeY * (1 - t);
    }
  
    return {
      x,
      y,
    };
  };
  

  const getRocketStyle = () => {
    if (gameState === "waiting") {
      return {
        transform: "translate(0, 0) rotate(0deg)",
        opacity: 1,
        transition:
          "transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 1s",
      };
    }

    const { x, y } = getFlightPosition(currentMultiplier);
    const rotation = Math.min(70, currentMultiplier * 3);

    return {
      transform: `translate(${x}vw, -${y}vh) rotate(${rotation}deg)`,
      opacity: gameState === "crashed" ? 0 : 1,
      transition:
        "transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 1s",
    };
  };

  const rocketStyle = getRocketStyle();

  return (
    <>
      <div
        ref={trailsContainerRef}
        className="absolute inset-0 pointer-events-none z-10"
      />
      <div
        ref={rocketRef}
        className="absolute left-10 bottom-10 z-20 transition-transform"
        style={rocketStyle}
      >
        <RocketIcon size={48} className="text-aviator-red transform rotate-100" />
      </div>
    </>
  );
};

export default Rocket;
