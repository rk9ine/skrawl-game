/**
 * Simple UUID generator that works with Hermes JavaScript engine
 * This is a workaround for the crypto.getRandomValues() not supported error
 */

// Generate a random hexadecimal string of the specified length
const randomHex = (length: number): string => {
  let result = '';
  const characters = '0123456789abcdef';
  const charactersLength = characters.length;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
};

/**
 * Generate a UUID v4 compatible string
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * Where y is one of: 8, 9, a, or b
 */
export const generateUUID = (): string => {
  // Generate random hexadecimal strings
  const part1 = randomHex(8);
  const part2 = randomHex(4);
  const part3 = '4' + randomHex(3); // Version 4 UUID always has a '4' at this position
  
  // For the 4th part, the first character must be one of: 8, 9, a, or b
  const yChar = '89ab'.charAt(Math.floor(Math.random() * 4));
  const part4 = yChar + randomHex(3);
  
  const part5 = randomHex(12);
  
  // Combine all parts with hyphens
  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
};
