
import { toast } from "sonner";

// Constants for game configuration
const BASE_RTP = 0.97; // 97% Return to Player (3% house edge)
const HASH_PRECISION = Math.pow(2, 32);

// Function to generate a crash point using a hash string
export const generateCrashPoint = (serverSeed: string, scalingFactor: number = 1): number => {
  // Convert the first 8 characters of the hash to a number between 0 and 1
  const hash = serverSeed.slice(0, 8);
  const hashDecimal = parseInt(hash, 16) / HASH_PRECISION;
  
  // Apply our probability distribution with scaling factor
  // Using an exponential curve to model crash points
  let result: number;
  
  // 60% - Below 2x, 30% - Between 2x-5x, 10% - Above 5x
  if (hashDecimal < 0.6 * scalingFactor) {
    // Below 2x: Linear distribution between 1 and 2
    result = 1 + hashDecimal / (0.6 * scalingFactor);
  } else if (hashDecimal < 0.9 * scalingFactor) {
    // Between 2x-5x: Adjusted distribution for middle range
    const normalizedVal = (hashDecimal - 0.6 * scalingFactor) / (0.3 * scalingFactor);
    result = 2 + (normalizedVal * 3);
  } else {
    // Above 5x: Exponential curve for high multipliers
    const normalizedVal = (hashDecimal - 0.9 * scalingFactor) / (0.1 * scalingFactor);
    // Base 5x + exponential growth for remaining 10%
    result = 5 + (20 * Math.pow(normalizedVal, 2));
  }
  
  // Round to 2 decimal places
  // return Math.round(result * 100) / 100;
  return 10;
};

// Function to generate a random server seed (in a real game, this would come from the server)
export const generateServerSeed = (): string => {
  return Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

// Function to calculate scaling factor based on recent payout history
export const calculateScalingFactor = (recentPayouts: number[]): number => {
  if (recentPayouts.length === 0) return 1;
  
  // Calculate average payout
  const averagePayout = recentPayouts.reduce((sum, val) => sum + val, 0) / recentPayouts.length;
  
  // If average payout is too high, increase scaling to favor lower crashes
  if (averagePayout > 3) {
    return 1.2; // Increase probability of lower multipliers
  } 
  // If average payout is very low, decrease scaling to allow higher crashes
  else if (averagePayout < 1.5) {
    return 0.9; // Allow more mid-range and high multipliers
  }
  
  return 1; // Default scaling
};

// Function to verify a crash point (for provably fair verification)
export const verifyCrashPoint = (serverSeed: string, clientSeed: string, nonce: number): number => {
  // In a real implementation, this would use HMAC-SHA256 with the server seed, client seed, and nonce
  // For this demo, we're simplifying
  const combinedSeed = serverSeed + clientSeed + nonce.toString();
  const hash = combinedSeed.slice(0, 8);
  const hashDecimal = parseInt(hash, 16) / HASH_PRECISION;
  
  // Same formula as generateCrashPoint
  if (hashDecimal < 0.6) {
    return 1 + hashDecimal / 0.6;
  } else if (hashDecimal < 0.9) {
    const normalizedVal = (hashDecimal - 0.6) / 0.3;
    return 2 + (normalizedVal * 3);
  } else {
    const normalizedVal = (hashDecimal - 0.9) / 0.1;
    return 5 + (20 * Math.pow(normalizedVal, 2));
  }
};

// Calculate bet result
export const calculateBetResult = (betAmount: number, cashoutMultiplier: number, crashPoint: number): number => {
  if (cashoutMultiplier <= crashPoint) {
    // User cashed out before crash
    return betAmount * cashoutMultiplier;
  } else {
    // User didn't cash out in time
    return 0;
  }
};

// Format currency 
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// Validate bet amount
export const validateBetAmount = (amount: number, balance: number): boolean => {
  if (amount <= 0) {
    toast.error("Bet amount must be greater than 0");
    return false;
  }
  
  if (amount > balance) {
    toast.error("Insufficient balance");
    return false;
  }
  
  return true;
};

// Calculate animation duration based on crash point
export const calculateAnimationDuration = (crashPoint: number): number => {
  // Higher crash points should take longer to reach
  // Base duration 3 seconds, scale up for higher multipliers
  const base = 3;
  const scale = Math.log(crashPoint) / Math.log(2); // Logarithmic scaling
  return base * scale;
};
