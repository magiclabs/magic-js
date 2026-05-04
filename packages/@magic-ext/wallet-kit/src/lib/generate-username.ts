const adjectives = [
  "bullish",
  "diamond",
  "cosmic",
  "brave",
  "bold",
  "swift",
  "curious",
  "fearless",
  "legendary",
  "epic",
  "mighty",
  "noble",
  "stellar",
  "zen",
  "cypherpunk",
  "early",
];

const nouns = [
  "ape",
  "whale",
  "bull",
  "bear",
  "wizard",
  "knight",
  "pioneer",
  "builder",
  "hodler",
  "trader",
  "miner",
  "validator",
  "guardian",
  "explorer",
  "voyager",
  "sage",
];

/**
 * Generates a random friendly username in the format: adjective-noun-randomNumber
 * Example:
 *  diamond-hodler-742
 *  cosmic-wizard-315
 *  brave-pioneer-928
 *  bullish-ape-456
 *  legendary-whale-123
 */
export function generateRandomUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNum = Math.floor(Math.random() * 1000);

  return `${adjective}-${noun}-${randomNum}`;
}
