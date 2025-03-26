
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
  
  // Calculate rocket position based on multiplier using a logarithmic curve
  // This better simulates a graph-like trajectory
  const getRocketStyle = () => {
    if (gameState === "waiting") {
      return {
        transform: "translate(0, 0) rotate(0deg)",
        opacity: 1,
        transition: "transform 0.5s cubic-bezier(0.165, 0.84, 0.44, 1), opacity 0.5s",
      };
    }
    
    // Calculate x position - logarithmic to start fast then slow down
    const xPos = Math.min(70, 15 * Math.log(currentMultiplier + 1));
    
    // Calculate y position - should follow an exponential curve (higher as multiplier grows)
    // Using negative value to move upwards from bottom
    const yPos = Math.min(70, 20 * Math.log(currentMultiplier + 1));
    
    // Rotation increases slightly with multiplier
    const rotation = Math.min(70, currentMultiplier * 3);
    
    return {
      transform: `translate(${xPos}vw, -${yPos}vh) rotate(${rotation}deg)`,
      opacity: gameState === "crashed" ? 0 : 1,
      transition: "transform 0.5s cubic-bezier(0.165, 0.84, 0.44, 1), opacity 0.5s",
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
        <RocketIcon 
          size={48} 
          className="text-aviator-red transform -rotate-90" 
        />
      </div>
      
      {/* Add a faint path line to visualize trajectory */}
      {gameState === "running" && (
        <svg className="absolute inset-0 h-full w-full overflow-visible z-5 opacity-20">
          <path
            d={`M 40,${400 - 40} Q ${200},${400 - 150} ${Math.min(400, 40 + currentMultiplier * 30)},${Math.max(50, 400 - (currentMultiplier * 20))}`}
            stroke="white"
            strokeWidth="1"
            fill="none"
            strokeDasharray="5,5"
          />
        </svg>
      )}
    </>
  );
};

export default Rocket;
