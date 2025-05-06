import crypto from 'crypto';

export const generateHash = (input) => {
  return crypto.createHash('sha256').update(input).digest('hex');
};

// Simulates a crash game multiplier between x1.00 and x∞ (with rare high values)
export function calculateCrashPoint(seed) {
    const hash = generateHash(seed);
    const h = parseInt(hash.slice(0, 8), 16); // Take first 4 bytes (8 hex chars)
    const max = 2 ** 32;
  
    if (h === 0) return 1.0;
  
    const result = Math.floor((100 * max) / (max - h)) / 100;
    return Math.max(1.0, result);
  }
  

// Example: seed = `${serverSeed}:${roundId}`
