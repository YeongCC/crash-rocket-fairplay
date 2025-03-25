
import React, { useEffect, useRef } from "react";
import { useGame } from "@/context/GameContext";
import { Rocket as RocketIcon } from "lucide-react";

const Rocket: React.FC = () => {
  const { gameState, currentMultiplier } = useGame();
  const rocketRef = useRef<HTMLDivElement>(null);
  const trailsContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Create rocket trails
  const createTrail = () => {
    if (!rocketRef.current || !trailsContainerRef.current) return;
    
    const rocketEl = rocketRef.current;
    const trailsContainer = trailsContainerRef.current;
    
    // Get rocket position
    const rect = rocketEl.getBoundingClientRect();
    
    // Create trail element
    const trail = document.createElement("div");
    trail.className = "rocket-trail";
    trail.style.width = `${30 + Math.random() * 20}px`;
    trail.style.left = `${rect.left}px`;
    trail.style.top = `${rect.top + rect.height / 2}px`;
    
    // Add to container
    trailsContainer.appendChild(trail);
    
    // Remove trail after animation
    setTimeout(() => {
      trail.remove();
    }, 300);
  };
  
  // Animate rocket movement
  useEffect(() => {
    if (gameState === "running") {
      let lastTrailTime = 0;
      
      const animate = (time: number) => {
        // Create trails at intervals
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
  
  // Calculate rocket position based on multiplier
  const rocketStyle = {
    transform: gameState === "running" || gameState === "crashed" 
      ? `translate(${Math.min(60, currentMultiplier * 4)}vw, -${Math.min(50, currentMultiplier * 8)}vh) rotate(${Math.min(45, currentMultiplier * 3)}deg)`
      : "translate(0, 0) rotate(0deg)",
    opacity: gameState === "crashed" ? 0 : 1,
    transition: "transform 0.5s cubic-bezier(0.165, 0.84, 0.44, 1), opacity 0.5s",
  };
  
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
        <RocketIcon 
          size={48} 
          className="text-aviator-red transform rotate-90" 
        />
      </div>
    </>
  );
};

export default Rocket;
