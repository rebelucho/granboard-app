/**
 * Session storage keys
 */
export const STORAGE_KEYS = {
  // Cricket game
  CRICKET_PLAYERS: "cricketPlayers",
  CRICKET_GAME_MODE: "cricketGameMode",
  CRICKET_MAX_ROUNDS: "cricketMaxRounds",

  // Zero-One game
  ZERO_ONE_PLAYERS: "zeroOnePlayers",
  ZERO_ONE_MODE: "zeroOneMode",
  ZERO_ONE_DOUBLE_OUT: "zeroOneDoubleOut",
  ZERO_ONE_MAX_ROUNDS: "zeroOneMaxRounds",
} as const;
