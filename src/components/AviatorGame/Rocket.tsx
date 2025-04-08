import React, { useEffect, useRef, useState } from "react";
import { useGame } from "@/context/GameContext";
import { Plane as RocketIcon } from "lucide-react";

interface RocketProps {
  canvasSize: { width: number; height: number };
}

const Rocket: React.FC<RocketProps> = ({ canvasSize }) => {
  const { gameState } = useGame();
  const rocketRef = useRef<HTMLDivElement>(null);
  const trailsContainerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const [isFloating, setIsFloating] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isCrashedOut, setIsCrashedOut] = useState(false);
  const crashVelocity = useRef({ x: 4, y: 4 });

  const target = {
    x: canvasSize.width - 100,
    y: canvasSize.height - 120,
  };

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
    setTimeout(() => trail.remove(), 300);
  };

  const animateNormal = () => {
    setPosition((prev) => {
      const distanceX = target.x - prev.x;
      const distanceY = target.y - prev.y;
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

      if (distance < 10) {
        const floatY = Math.sin(Date.now() / 200) * 5;
        return {
          x: target.x,
          y: target.y + floatY,
        };
      }

      const moveSpeed = 0.009;
      return {
        x: prev.x + distanceX * moveSpeed,
        y: prev.y + distanceY * moveSpeed,
      };
    });

    createTrail();
    requestRef.current = requestAnimationFrame(animateNormal);
  };

  const animateCrashOut = () => {
    setPosition((prev) => {
      const nextX = prev.x + crashVelocity.current.x;
      const nextY = prev.y + crashVelocity.current.y;

      crashVelocity.current.x *= 1.05;
      crashVelocity.current.y *= 1.05;

      return { x: nextX, y: nextY };
    });

    requestRef.current = requestAnimationFrame(animateCrashOut);
  };

  useEffect(() => {
    if (gameState === "running") {
      setIsFloating(false);
      setIsCrashedOut(false);
      requestRef.current = requestAnimationFrame(animateNormal);
    }

    if (gameState === "waiting") {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      setIsFloating(false);
      setIsCrashedOut(false);
      setPosition({ x: 0, y: 0 });
      crashVelocity.current = { x: 4, y: 4 };
    }

    if (gameState === "crashed") {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      setIsFloating(false);
      setIsCrashedOut(true);
      requestRef.current = requestAnimationFrame(animateCrashOut);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, canvasSize]);

  const rocketStyle = {
    left: position.x,
    bottom: position.y,
    transform: "rotate(30deg)",
    transition: "none",
  };

  return (
    <>
    <div ref={trailsContainerRef} className="absolute inset-0 pointer-events-none z-10" />
    <div ref={rocketRef} className="absolute z-20" style={rocketStyle}>
      <img src="/plane.png" alt="Plane" width={80} height={80} />
    </div>
  </>
  );
};

export default Rocket;
